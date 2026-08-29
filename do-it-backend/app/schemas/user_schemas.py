import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

Gender = Literal["male", "female"]
FitnessGoal = Literal[
    "general", "strength", "mobility", "walking", "running", "sports", "custom", "none"
]
WorkoutFrequencyType = Literal["daily", "weekly", "monthly"]


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    username: str = Field(min_length=3, max_length=60)
    email: EmailStr
    whatsapp_number: str | None = None
    password: str = Field(min_length=8, max_length=128)
    # Collected at registration per the updated flow — front-loaded
    # instead of asked again during onboarding.
    gender: Gender
    fitness_goal: FitnessGoal = "general"
    workout_frequency_type: WorkoutFrequencyType = "weekly"
    # Required for weekly/monthly, ignored for daily (every day, by
    # definition) and for a 'none' fitness goal.
    workout_frequency_count: int | None = Field(default=None, ge=1, le=31)

    @model_validator(mode="after")
    def _validate_frequency_count(self):
        if self.fitness_goal == "none":
            self.workout_frequency_count = None
            return self
        if self.workout_frequency_type == "daily":
            self.workout_frequency_count = None
        elif self.workout_frequency_count is None:
            raise ValueError(
                "workout_frequency_count is required for weekly/monthly frequency"
            )
        elif self.workout_frequency_type == "weekly" and self.workout_frequency_count > 7:
            raise ValueError("workout_frequency_count can't exceed 7 for a weekly goal")
        return self


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    username: str
    email: EmailStr
    whatsapp_number: str | None = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    username: str | None = Field(default=None, min_length=3, max_length=60)
    email: EmailStr | None = None
    whatsapp_number: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UserPreferencesOut(BaseModel):
    wake_time: str | None = None
    sleep_time: str | None = None
    study_duration: int | None = None
    break_duration: int | None = None
    timezone: str
    gender: str | None = None
    fitness_goal: str
    workout_frequency_type: str
    workout_frequency_count: int | None = None
    onboarding_completed: bool

    class Config:
        from_attributes = True


class UserPreferencesUpdate(BaseModel):
    wake_time: str | None = None
    sleep_time: str | None = None
    study_duration: int | None = None
    break_duration: int | None = None
    timezone: str | None = None
    gender: Gender | None = None
    fitness_goal: FitnessGoal | None = None
    workout_frequency_type: WorkoutFrequencyType | None = None
    workout_frequency_count: int | None = Field(default=None, ge=1, le=31)
    onboarding_completed: bool | None = None