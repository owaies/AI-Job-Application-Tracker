from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


APPLICATION_STATUSES = {
    "saved",
    "applied",
    "screening",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
}


class JobApplicationBase(BaseModel):
    company: str = Field(min_length=1, max_length=150)
    role: str = Field(min_length=1, max_length=150)
    location: Optional[str] = Field(default=None, max_length=150)
    status: str = Field(default="applied", max_length=40)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None
    notes: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    company: Optional[str] = Field(default=None, min_length=1, max_length=150)
    role: Optional[str] = Field(default=None, min_length=1, max_length=150)
    location: Optional[str] = Field(default=None, max_length=150)
    status: Optional[str] = Field(default=None, max_length=40)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None
    notes: Optional[str] = None


class JobApplicationRead(JobApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    application_date: datetime
    created_at: datetime
    updated_at: datetime
