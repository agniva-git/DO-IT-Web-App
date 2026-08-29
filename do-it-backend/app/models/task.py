import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    priority: Mapped[str] = mapped_column(String(10), default="medium")  # low/medium/high
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/completed
    category: Mapped[str] = mapped_column(String(40), default="Other")
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=0)
    # Bumped each time a task rolls past its due date still pending —
    # incremented by application logic, not automatically by the DB.
    # At 3, the frontend shows the "why didn't you finish this?" prompt.
    miss_count: Mapped[int] = mapped_column(Integer, default=0)
    # Keyed by ISO date string ("2026-08-20": true) rather than a fixed-
    # length array — a checkbox-per-day list generated fresh from
    # today→due_date would misalign against a positional array as the
    # days remaining shrinks each day this task stays open.
    daily_progress: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    miss_reasons: Mapped[list["TaskMissReason"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )


class TaskMissReason(Base):
    __tablename__ = "task_miss_reasons"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE")
    )
    reason: Mapped[str] = mapped_column(String(60), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task: Mapped["Task"] = relationship(back_populates="miss_reasons")