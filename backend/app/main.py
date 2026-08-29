from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Job Application Tracker API",
    version="0.1.0",
    description="Backend API for the AI Job Application Tracker.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Return a lightweight readiness response for local development."""
    return {"status": "ok", "service": "ai-job-application-tracker-api"}
