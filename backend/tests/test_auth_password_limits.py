import pytest
from pydantic import ValidationError

from app.schemas_auth import LoginRequest, RegisterRequest


@pytest.mark.parametrize("request_model", [RegisterRequest, LoginRequest])
def test_auth_requests_accept_passwords_within_bcrypt_byte_limit(request_model):
    assert request_model(email="user@example.com", password="a" * 72).password == "a" * 72
    assert request_model(email="user@example.com", password="é" * 36).password == "é" * 36


@pytest.mark.parametrize("request_model", [RegisterRequest, LoginRequest])
@pytest.mark.parametrize("password", ["a" * 73, "é" * 37])
def test_auth_requests_reject_passwords_over_bcrypt_byte_limit(request_model, password):
    with pytest.raises(ValidationError, match="72 UTF-8 bytes"):
        request_model(email="user@example.com", password=password)
