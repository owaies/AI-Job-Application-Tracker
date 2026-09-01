from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.applications import router as applications_router
from app.routes.auth import router as auth_router
from app.settings import settings

app = FastAPI(title="AI Job Application Tracker API", version="0.4.0", description="Backend API for the AI Job Application Tracker.")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(applications_router)


@app.get("/api/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-job-application-tracker-api"}
