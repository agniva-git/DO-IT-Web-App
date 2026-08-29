import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.study_models import StudyGoal, StudySession
from app.models.user import User
from app.schemas.study_schemas import (
    StudyGoalCreate,
    StudyGoalOut,
    StudyGoalUpdate,
    StudySessionCreate,
    StudySessionOut,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/study", tags=["study"])


def _get_owned_goal(goal_id: uuid.UUID, user: User, db: Session) -> StudyGoal:
    goal = db.get(StudyGoal, goal_id)
    if not goal or goal.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Study goal not found")
    return goal


@router.get("/goals", response_model=list[StudyGoalOut])
def list_goals(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(StudyGoal)
        .filter(StudyGoal.user_id == current_user.id)
        .order_by(StudyGoal.target_date.asc())
        .all()
    )


@router.post("/goals", response_model=StudyGoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: StudyGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = StudyGoal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/goals/{goal_id}", response_model=StudyGoalOut)
def update_goal(
    goal_id: uuid.UUID,
    payload: StudyGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = _get_owned_goal(goal_id, current_user, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = _get_owned_goal(goal_id, current_user, db)
    db.delete(goal)
    db.commit()


@router.get("/sessions", response_model=list[StudySessionOut])
def list_sessions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(StudySession.date.desc())
        .all()
    )


@router.post(
    "/sessions", response_model=StudySessionOut, status_code=status.HTTP_201_CREATED
)
def create_session(
    payload: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = StudySession(user_id=current_user.id, **payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session