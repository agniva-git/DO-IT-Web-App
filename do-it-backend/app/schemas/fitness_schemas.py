import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class WorkoutCreate(BaseModel):
    body_parts: list[str] = Field(min_length=1)
    duration: int = Field(gt=0)
    date: date


class WorkoutOut(BaseModel):
    id: uuid.UUID
    body_parts: list[str]
    duration: int
    date: date
    created_at: datetime

    class Config:
        from_attributes = True