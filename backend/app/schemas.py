from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


APPLICATION_STATUSES = {
    "saved",
    "applied",
    "screening",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
}
PRIORITIES = {"low", "medium", "high"}


class JobApplicationBase(BaseModel):
    company: str = Field(min_length=1, max_length=150)
    role: str = Field(min_length=1, max_length=150)

    @field_validator("company", "role", mode="before")
    @classmethod
    def normalize_required_application_text(cls, value):
        return value.strip() if isinstance(value, str) else value
    location: Optional[str] = Field(default=None, max_length=150)
    status: str = Field(default="applied", max_length=40)
    priority: str = Field(default="medium", max_length=20)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    next_action: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=5000)


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    company: Optional[str] = Field(default=None, min_length=1, max_length=150)
    role: Optional[str] = Field(default=None, min_length=1, max_length=150)
    location: Optional[str] = Field(default=None, max_length=150)
    status: Optional[str] = Field(default=None, max_length=40)
    priority: Optional[str] = Field(default=None, max_length=20)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None

    @field_validator("company", "role", mode="before")
    @classmethod
    def normalize_required_update_text(cls, value):
        if value is None:
            raise ValueError("Company and role cannot be null")
        return value.strip() if isinstance(value, str) else value

    @field_validator("application_date", mode="before")
    @classmethod
    def reject_null_application_date(cls, value):
        if value is None:
            raise ValueError("Application date cannot be null")
        return value
    follow_up_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    next_action: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=5000)


class JobApplicationRead(JobApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    application_date: datetime
    created_at: datetime
    updated_at: datetime


class SmartAction(BaseModel):
    application_id: int
    company: str
    role: str
    priority: str
    recommendation: str
    reason: str
