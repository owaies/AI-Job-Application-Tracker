from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import JobApplication

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("")
def list_applications(db: Session = Depends(get_db)) -> list[JobApplication]:
    """List applications for the MVP development user."""
    return list(db.scalars(select(JobApplication).order_by(JobApplication.created_at.desc())))
