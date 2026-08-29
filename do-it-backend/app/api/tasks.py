import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.task import Task, TaskMissReason
from app.models.user import User
from app.schemas.task_schemas import MissReasonCreate, TaskCreate, TaskOut, TaskUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _get_owned_task(task_id: uuid.UUID, user: User, db: Session) -> Task:
    """Fetches a task and 404s if it doesn't exist OR belongs to someone
    else — deliberately the same error for both cases, so this endpoint
    never leaks whether a given task ID exists for another user."""
    task = db.get(Task, task_id)
    if not task or task.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.due_date.asc())
        .all()
    )


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = Task(user_id=current_user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_task(task_id, current_user, db)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user, db)
    db.delete(task)
    db.commit()


@router.post("/{task_id}/complete", response_model=TaskOut)
def toggle_complete(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user, db)
    if task.status == "completed":
        task.status = "pending"
        task.completed_at = None
    else:
        task.status = "completed"
        task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/miss-reason", status_code=status.HTTP_201_CREATED)
def log_miss_reason(
    task_id: uuid.UUID,
    payload: MissReasonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(task_id, current_user, db)
    db.add(TaskMissReason(task_id=task.id, reason=payload.reason))
    # Logging a reason resets the counter — the frontend only re-prompts
    # after 3 *new* misses, not on every subsequent open.
    task.miss_count = 0
    db.commit()
    return {"detail": "Miss reason logged"}