import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models import Base


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = Session()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(engine)


def register(client, email):
    response = client.post("/api/auth/register", json={"email": email, "password": "password123", "full_name": "Test User"})
    assert response.status_code == 201
    return response.json()["access_token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def test_health_and_auth(client):
    assert client.get("/api/health").json()["status"] == "ok"
    token = register(client, "one@example.com")
    me = client.get("/api/auth/me", headers=auth_header(token))
    assert me.status_code == 200
    assert me.json()["full_name"] == "Test User"


def test_application_crud_search_analytics_and_smart_actions(client):
    token = register(client, "owner@example.com")
    headers = auth_header(token)
    payload = {
        "company": "Acme Labs",
        "role": "Backend Engineer",
        "location": "Bengaluru",
        "status": "applied",
        "priority": "high",
        "follow_up_date": "2026-01-01T10:00:00Z",
        "next_action": "Email recruiter",
    }
    created = client.post("/api/applications", json=payload, headers=headers)
    assert created.status_code == 201
    application_id = created.json()["id"]
    assert created.json()["priority"] == "high"

    searched = client.get("/api/applications?search=Acme", headers=headers)
    assert searched.status_code == 200
    assert len(searched.json()) == 1

    smart = client.get("/api/applications/smart-actions", headers=headers)
    assert smart.status_code == 200
    assert smart.json()[0]["recommendation"] == "Send a follow-up message"

    analytics = client.get("/api/applications/analytics", headers=headers)
    assert analytics.status_code == 200
    assert analytics.json()["total"] == 1
    assert analytics.json()["by_status"]["applied"] == 1

    updated = client.patch(f"/api/applications/{application_id}", json={"status": "interview", "priority": "medium"}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["status"] == "interview"

    deleted = client.delete(f"/api/applications/{application_id}", headers=headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/applications/{application_id}", headers=headers).status_code == 404


def test_user_scoping(client):
    owner = register(client, "owner2@example.com")
    other = register(client, "other@example.com")
    created = client.post("/api/applications", json={"company": "Private Co", "role": "Engineer"}, headers=auth_header(owner))
    assert created.status_code == 201
    application_id = created.json()["id"]
    assert client.get(f"/api/applications/{application_id}", headers=auth_header(other)).status_code == 404
    assert client.patch(f"/api/applications/{application_id}", json={"status": "offer"}, headers=auth_header(other)).status_code == 404
    assert client.delete(f"/api/applications/{application_id}", headers=auth_header(other)).status_code == 404


def test_validation(client):
    token = register(client, "validation@example.com")
    headers = auth_header(token)
    bad_status = client.post("/api/applications", json={"company": "X", "role": "Y", "status": "unknown"}, headers=headers)
    assert bad_status.status_code == 422
    bad_priority = client.post("/api/applications", json={"company": "X", "role": "Y", "priority": "urgent"}, headers=headers)
    assert bad_priority.status_code == 422
