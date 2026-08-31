from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import JobApplication
from app.schemas import (
    APPLICATION_STATUSES,
    JobApplicationCreate,
    JobApplicationRead,
    JobApplicationUpdate,
)

router = APIRouter(prefix="/api/applications", tags=["applications"])

# Authentication is introduced in the next backend milestone. Until then,
# application records use a dedicated development user so the API remains testable.
DEV_USER_ID = 1


def _validate_status(value: str) -> None:
    if value not in APPLICATION_STATUSES:
        allowed = ", ".join(sorted(APPLICATION_STATUSES))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Expected one of: {allowed}",
        )


@router.get("", response_model=list[JobApplicationRead])
def list_applications(db: Session = Depends(get_db)) -> list[JobApplication]:
    return list(
        db.scalars(
            select(JobApplication)
            .where(JobApplication.user_id == DEV_USER_ID)
            .order_by(JobApplication.created_at.desc())
        )
    )


@router.get("/{application_id}", response_model=JobApplicationRead)
def get_application(application_id: int, db: Session = Depends(get_db)) -> JobApplication:
    application = db.scalar(
        select(JobApplication).where(
            JobApplication.id == application_id,
            JobApplication.user_id == DEV_USER_ID,
        )
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.post("", response_model=JobApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: JobApplicationCreate, db: Session = Depends(get_db)
) -> JobApplication:
    _validate_status(payload.status)
    application = JobApplication(user_id=DEV_USER_ID, **payload.model_dump(exclude_none=True))
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.patch("/{application_id}", response_model=JobApplicationRead)
def update_application(
    application_id: int,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_db),
) -> JobApplication:
    application = get_application(application_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if "status" in changes:
        _validate_status(changes["status"])
    for field, value in changes.items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)) -> None:
    application = get_application(application_id, db)
    db.delete(application)
    db.commit()
