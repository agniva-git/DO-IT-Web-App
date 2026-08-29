import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

Priority = Literal["low", "medium", "high"]
TaskStatus = Literal["pending", "completed"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: Priority = "medium"
    category: str = "Other"
    due_date: date
    estimated_minutes: int = Field(default=0, ge=0)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    priority: Priority | None = None
    category: str | None = None
    due_date: date | None = None
    estimated_minutes: int | None = Field(default=None, ge=0)
    daily_progress: dict[str, bool] | None = None


class TaskOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    priority: str
    status: str
    category: str
    due_date: date
    estimated_minutes: int
    miss_count: int
    daily_progress: dict[str, bool]
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True


class MissReasonCreate(BaseModel):
    reason: str = Field(min_length=1, max_length=60)