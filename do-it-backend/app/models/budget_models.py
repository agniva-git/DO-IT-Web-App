import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class BudgetMonth(Base):
    __tablename__ = "budget_months"
    __table_args__ = (
        # One budget per calendar month per user — recreate by deleting
        # and starting over rather than silently overwriting.
        UniqueConstraint("user_id", "year", "month", name="uq_budget_user_year_month"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-12
    income: Mapped[float] = mapped_column(Float, nullable=False)
    savings_mode: Mapped[str] = mapped_column(String(10), nullable=False)  # percentage/amount
    savings_value: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    categories: Mapped[list["BudgetCategory"]] = relationship(
        back_populates="budget_month", cascade="all, delete-orphan"
    )


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    budget_month_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("budget_months.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    input_mode: Mapped[str] = mapped_column(String(10), nullable=False)  # percentage/amount
    value: Mapped[float] = mapped_column(Float, nullable=False)
    # The auto-created "Sudden Expenses" category on every month — always
    # present, never deletable, name/allocation never editable. Detected
    # by this flag rather than by name string, so renaming can never be
    # confused with the special category itself.
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    budget_month: Mapped["BudgetMonth"] = relationship(back_populates="categories")
    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    budget_category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("budget_categories.id", ondelete="CASCADE"), index=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped["BudgetCategory"] = relationship(back_populates="expenses")