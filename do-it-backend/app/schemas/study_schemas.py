import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class StudyGoalCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=100)
    target_date: date
    hours_per_week: int = Field(default=0, ge=0)


class StudyGoalUpdate(BaseModel):
    subject: str | None = Field(default=None, min_length=1, max_length=100)
    target_date: date | None = None
    hours_per_week: int | None = Field(default=None, ge=0)


class StudyGoalOut(BaseModel):
    id: uuid.UUID
    subject: str
    target_date: date
    hours_per_week: int

    class Config:
        from_attributes = True


class StudySessionCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=100)
    duration: int = Field(gt=0)
    date: date


class StudySessionOut(BaseModel):
    id: uuid.UUID
    subject: str
    duration: int
    date: date
    created_at: datetime

    class Config:
        from_attributes = True