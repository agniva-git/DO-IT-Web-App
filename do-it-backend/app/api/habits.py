import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.habit_models import Habit, HabitLog
from app.models.user import User
from app.schemas.habit_schemas import CheckInRequest, HabitCreate, HabitLogOut, HabitOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/habits", tags=["habits"])


def _get_owned_habit(habit_id: uuid.UUID, user: User, db: Session) -> Habit:
    habit = db.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Habit not found")
    return habit


@router.get("", response_model=list[HabitOut])
def list_habits(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    payload: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = Habit(user_id=current_user.id, **payload.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = _get_owned_habit(habit_id, current_user, db)
    db.delete(habit)
    db.commit()


@router.get("/logs", response_model=list[HabitLogOut])
def list_logs(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Flat list across all of the user's habits — the frontend's
    # streak/consistency calculations filter this client-side per habit,
    # same shape whether it's 1 habit or 50.
    return (
        db.query(HabitLog)
        .join(Habit, Habit.id == HabitLog.habit_id)
        .filter(Habit.user_id == current_user.id)
        .all()
    )


@router.post("/{habit_id}/check-in", response_model=HabitLogOut)
def check_in(
    habit_id: uuid.UUID,
    payload: CheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_habit(habit_id, current_user, db)  # 404s if not owned

    existing = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.date == payload.date)
        .first()
    )
    if existing:
        existing.completed = payload.completed
        db.commit()
        db.refresh(existing)
        return existing

    log = HabitLog(habit_id=habit_id, date=payload.date, completed=payload.completed)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log