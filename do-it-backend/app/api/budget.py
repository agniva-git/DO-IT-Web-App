import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.budget_models import BudgetCategory, BudgetMonth, Expense
from app.models.user import User
from app.schemas.budget_schemas import (
    BudgetMonthCreate,
    BudgetMonthOut,
    BudgetMonthSummaryOut,
    CategoryInput,
    CategoryOut,
    CategoryUpdate,
    ExpenseCreate,
    ExpenseOut,
    ExpenseWithCategoryOut,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/budget", tags=["budget"])

SUDDEN_EXPENSES_NAME = "Sudden Expenses"


def _compute_amount(mode: str, value: float, income: float) -> float:
    return round(income * value / 100, 2) if mode == "percentage" else round(value, 2)


def _get_owned_month(month_id: uuid.UUID, user: User, db: Session) -> BudgetMonth:
    month = db.get(BudgetMonth, month_id)
    if not month or month.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Budget month not found")
    return month


def _get_owned_category(category_id: uuid.UUID, user: User, db: Session) -> BudgetCategory:
    category = db.get(BudgetCategory, category_id)
    if not category or category.budget_month.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
    return category


def _build_month_out(month: BudgetMonth) -> BudgetMonthOut:
    """Computes spent/remaining/percent_used per category and the month's
    totals fresh from the current expense rows — never cached, so it's
    always accurate even if this is called right after logging a spend."""
    category_outs = []
    total_spent = 0.0
    total_category_allocated = 0.0

    for cat in month.categories:
        computed = _compute_amount(cat.input_mode, cat.value, month.income)
        spent = sum(e.amount for e in cat.expenses)
        remaining = round(computed - spent, 2)
        percent_used = round((spent / computed) * 100, 1) if computed > 0 else 0.0

        category_outs.append(
            CategoryOut(
                id=cat.id,
                name=cat.name,
                input_mode=cat.input_mode,
                value=cat.value,
                computed_amount=computed,
                spent=round(spent, 2),
                remaining=remaining,
                percent_used=percent_used,
                is_default=cat.is_default,
            )
        )
        total_spent += spent
        # The default "Sudden Expenses" category has no real allocation
        # (value=0) — it shouldn't count toward "planned" spending, only
        # toward the actual total spent.
        if not cat.is_default:
            total_category_allocated += computed

    savings_amount = _compute_amount(month.savings_mode, month.savings_value, month.income)
    total_allocated = round(total_category_allocated + savings_amount, 2)
    unallocated = round(month.income - total_allocated, 2)

    return BudgetMonthOut(
        id=month.id,
        year=month.year,
        month=month.month,
        income=month.income,
        savings_mode=month.savings_mode,
        savings_value=month.savings_value,
        savings_amount=savings_amount,
        categories=category_outs,
        total_allocated=total_allocated,
        total_spent=round(total_spent, 2),
        unallocated=unallocated,
        created_at=month.created_at,
    )


@router.get("/months", response_model=list[BudgetMonthSummaryOut])
def list_months(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    months = (
        db.query(BudgetMonth)
        .filter(BudgetMonth.user_id == current_user.id)
        .order_by(BudgetMonth.year.desc(), BudgetMonth.month.desc())
        .all()
    )
    summaries = []
    for m in months:
        full = _build_month_out(m)
        summaries.append(
            BudgetMonthSummaryOut(
                id=full.id,
                year=full.year,
                month=full.month,
                income=full.income,
                savings_amount=full.savings_amount,
                total_allocated=full.total_allocated,
                total_spent=full.total_spent,
            )
        )
    return summaries


@router.post("/months", response_model=BudgetMonthOut, status_code=status.HTTP_201_CREATED)
def create_month(
    payload: BudgetMonthCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(BudgetMonth)
        .filter(
            BudgetMonth.user_id == current_user.id,
            BudgetMonth.year == payload.year,
            BudgetMonth.month == payload.month,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A budget already exists for that month — delete it first to redo it.",
        )

    month = BudgetMonth(
        user_id=current_user.id,
        year=payload.year,
        month=payload.month,
        income=payload.income,
        savings_mode=payload.savings_mode,
        savings_value=payload.savings_value,
    )
    db.add(month)
    db.flush()

    for cat in payload.categories:
        db.add(
            BudgetCategory(
                budget_month_id=month.id,
                name=cat.name,
                input_mode=cat.input_mode,
                value=cat.value,
            )
        )

    # Every month automatically gets a "Sudden Expenses" catch-all —
    # non-deletable, non-editable, no real allocation (value=0), for
    # unplanned spending that doesn't fit any planned category.
    db.add(
        BudgetCategory(
            budget_month_id=month.id,
            name=SUDDEN_EXPENSES_NAME,
            input_mode="amount",
            value=0,
            is_default=True,
        )
    )

    db.commit()
    db.refresh(month)
    return _build_month_out(month)


@router.get("/months/{month_id}", response_model=BudgetMonthOut)
def get_month(
    month_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    month = _get_owned_month(month_id, current_user, db)
    return _build_month_out(month)


@router.get("/months/{month_id}/expenses", response_model=list[ExpenseWithCategoryOut])
def list_month_expenses(
    month_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Every expense across every category in this month, tagged with
    which category it belongs to — used by the Dashboard to show
    'today's expenses' without knowing category IDs up front."""
    month = _get_owned_month(month_id, current_user, db)
    results = [
        ExpenseWithCategoryOut(
            id=exp.id,
            budget_category_id=cat.id,
            amount=exp.amount,
            date=exp.date,
            note=exp.note,
            created_at=exp.created_at,
            category_name=cat.name,
        )
        for cat in month.categories
        for exp in cat.expenses
    ]
    return sorted(results, key=lambda e: e.date, reverse=True)


@router.delete("/months/{month_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_month(
    month_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    month = _get_owned_month(month_id, current_user, db)
    db.delete(month)
    db.commit()


@router.post(
    "/months/{month_id}/categories",
    response_model=BudgetMonthOut,
    status_code=status.HTTP_201_CREATED,
)
def add_category(
    month_id: uuid.UUID,
    payload: CategoryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adds a category to an already-created month — for something
    planned partway through the month that didn't get a slot at setup."""
    month = _get_owned_month(month_id, current_user, db)
    db.add(
        BudgetCategory(
            budget_month_id=month.id,
            name=payload.name,
            input_mode=payload.input_mode,
            value=payload.value,
        )
    )
    db.commit()
    db.refresh(month)
    return _build_month_out(month)


@router.patch("/categories/{category_id}", response_model=BudgetMonthOut)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Renames a category — the allocated amount/mode is permanently
    locked once set, by design, and the default category can't be
    touched at all."""
    category = _get_owned_category(category_id, current_user, db)
    if category.is_default:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This category can't be edited")

    category.name = payload.name
    db.commit()
    db.refresh(category.budget_month)
    return _build_month_out(category.budget_month)


@router.delete("/categories/{category_id}", response_model=BudgetMonthOut)
def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = _get_owned_category(category_id, current_user, db)
    if category.is_default:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This category can't be deleted")

    month = category.budget_month
    db.delete(category)
    db.commit()
    db.refresh(month)
    return _build_month_out(month)


@router.get("/categories/{category_id}/expenses", response_model=list[ExpenseOut])
def list_category_expenses(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = _get_owned_category(category_id, current_user, db)
    return sorted(category.expenses, key=lambda e: e.date, reverse=True)


@router.post(
    "/categories/{category_id}/expenses",
    response_model=ExpenseOut,
    status_code=status.HTTP_201_CREATED,
)
def log_expense(
    category_id: uuid.UUID,
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = _get_owned_category(category_id, current_user, db)

    # Sudden Expenses has no planned purpose, so a description is
    # mandatory there — every other category leaves the note optional.
    if category.is_default and not (payload.note and payload.note.strip()):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Please describe what this sudden expense was for.",
        )

    expense = Expense(budget_category_id=category.id, **payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

# Logged expenses are permanent by design — no delete endpoint. If a
# mistake needs correcting, that's a future "edit expense" feature, not
# silent deletion of financial history.