from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fitness_models import Workout
from app.models.user import User
from app.schemas.fitness_schemas import WorkoutCreate, WorkoutOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/fitness", tags=["fitness"])


@router.get("/workouts", response_model=list[WorkoutOut])
def list_workouts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.date.desc())
        .all()
    )


@router.post("/workouts", response_model=WorkoutOut, status_code=status.HTTP_201_CREATED)
def create_workout(
    payload: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout = Workout(user_id=current_user.id, **payload.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout