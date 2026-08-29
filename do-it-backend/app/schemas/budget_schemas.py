import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

InputMode = Literal["percentage", "amount"]


class CategoryInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    input_mode: InputMode
    value: float = Field(gt=0)


class CategoryUpdate(BaseModel):
    # Only the name can ever change after creation — the allocated
    # amount/mode is locked once a category is set up, by design.
    name: str = Field(min_length=1, max_length=80)


class BudgetMonthCreate(BaseModel):
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12)
    income: float = Field(gt=0)
    savings_mode: InputMode
    savings_value: float = Field(ge=0)
    categories: list[CategoryInput] = Field(min_length=1)


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    date: date
    note: str | None = Field(default=None, max_length=200)


class ExpenseOut(BaseModel):
    id: uuid.UUID
    budget_category_id: uuid.UUID
    amount: float
    date: date
    note: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseWithCategoryOut(ExpenseOut):
    category_name: str


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    input_mode: str
    value: float
    computed_amount: float
    spent: float
    remaining: float
    percent_used: float
    is_default: bool

    class Config:
        from_attributes = True


class BudgetMonthOut(BaseModel):
    id: uuid.UUID
    year: int
    month: int
    income: float
    savings_mode: str
    savings_value: float
    savings_amount: float
    categories: list[CategoryOut]
    total_allocated: float  # sum of category amounts + savings
    total_spent: float
    unallocated: float  # income - total_allocated; negative means over-budget
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetMonthSummaryOut(BaseModel):
    id: uuid.UUID
    year: int
    month: int
    income: float
    savings_amount: float
    total_allocated: float
    total_spent: float