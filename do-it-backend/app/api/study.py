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
    goals = (
        db.query(StudyGoal)
        .filter(StudyGoal.user_id == current_user.id)
        .order_by(StudyGoal.target_date.asc())
        .all()
    )
    for g in goals:
        if (g.hours_per_day is None or g.hours_per_day == 0) and g.hours_per_week:
            g.hours_per_day = round(g.hours_per_week / 7, 1)
    return goals


@router.post("/goals", response_model=StudyGoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: StudyGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump()
    if data.get("hours_per_day") and not data.get("hours_per_week"):
        data["hours_per_week"] = int(round(data["hours_per_day"] * 7))
    elif data.get("hours_per_week") and not data.get("hours_per_day"):
        data["hours_per_day"] = round(data["hours_per_week"] / 7, 1)
    goal = StudyGoal(user_id=current_user.id, **data)
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
    data = payload.model_dump(exclude_unset=True)
    if "hours_per_day" in data and "hours_per_week" not in data:
        data["hours_per_week"] = int(round((data["hours_per_day"] or 0) * 7))
    elif "hours_per_week" in data and "hours_per_day" not in data:
        data["hours_per_day"] = round((data["hours_per_week"] or 0) / 7, 1)
    for key, value in data.items():
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


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.get(StudySession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Study session not found")
    db.delete(session)
    db.commit()