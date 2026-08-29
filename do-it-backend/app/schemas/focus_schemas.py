import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

FocusStatus = Literal["complete", "partial", "skipped"]


class FocusSessionCreate(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    planned_minutes: int = Field(gt=0)
    date: date
    status: FocusStatus


class FocusSessionOut(BaseModel):
    id: uuid.UUID
    label: str
    planned_minutes: int
    date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True