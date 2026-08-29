from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.focus_models import FocusSession
from app.models.user import User
from app.schemas.focus_schemas import FocusSessionCreate, FocusSessionOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/focus", tags=["focus"])


@router.get("/sessions", response_model=list[FocusSessionOut])
def list_sessions(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(FocusSession)
        .filter(FocusSession.user_id == current_user.id)
        .order_by(FocusSession.date.desc())
        .all()
    )


@router.post(
    "/sessions", response_model=FocusSessionOut, status_code=status.HTTP_201_CREATED
)
def create_session(
    payload: FocusSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = FocusSession(user_id=current_user.id, **payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session