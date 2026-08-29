import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

HabitType = Literal["build", "leave"]
Frequency = Literal["daily", "weekly"]


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    frequency: Frequency = "daily"
    type: HabitType = "build"


class HabitOut(BaseModel):
    id: uuid.UUID
    name: str
    frequency: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


class HabitLogOut(BaseModel):
    habit_id: uuid.UUID
    date: date
    completed: bool

    class Config:
        from_attributes = True


class CheckInRequest(BaseModel):
    date: date
    completed: bool