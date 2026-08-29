import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    username: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # unique=True: a phone number can only ever belong to one account.
    # Nullable stays True since it's optional at signup — Postgres allows
    # multiple NULLs under a unique constraint, so that's safe.
    whatsapp_number: Mapped[str | None] = mapped_column(
        String(20), unique=True, nullable=True, index=True
    )
    # Password reset — a hashed lookup token (never the raw token) with an
    # expiry. Cleared once used or replaced by a newer request.
    reset_token_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    preferences: Mapped["UserPreferences"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    wake_time: Mapped[str | None] = mapped_column(String(5), nullable=True)  # "HH:MM"
    sleep_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    study_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # minutes
    break_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # minutes
    timezone: Mapped[str] = mapped_column(String(60), default="UTC")
    # Collected at registration now, not during onboarding — gender drives
    # which body-part list shows in the Fitness module.
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    fitness_goal: Mapped[str] = mapped_column(String(20), default="general")
    # How often the person wants to work out — collected at registration
    # alongside gender/fitness_goal. 'daily' has no count (every day, by
    # definition); 'weekly'/'monthly' store how many days within that
    # window. Null count when the goal is 'none' or type is 'daily'.
    workout_frequency_type: Mapped[str] = mapped_column(String(10), default="weekly")
    workout_frequency_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="preferences")