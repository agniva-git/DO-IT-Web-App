from datetime import date
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.habit_models import Habit, HabitLog
from app.models.notification_models import NotificationSubscription
from app.models.task import Task
from app.models.user import User
from app.utils.deps import get_current_user
from app.utils.push import send_web_push

router = APIRouter(prefix="/notifications", tags=["notifications"])


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class SubscribeRequest(BaseModel):
    endpoint: str
    keys: PushKeys


class UnsubscribeRequest(BaseModel):
    endpoint: str


def _dispatch_user_push(user_id, payload: dict, db: Session) -> int:
    """Dispatches a web push payload to all registered subscriptions for a user."""
    subs = (
        db.query(NotificationSubscription)
        .filter(NotificationSubscription.user_id == user_id)
        .all()
    )
    sent_count = 0
    expired_subs = []

    for sub in subs:
        sub_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth,
            },
        }
        res = send_web_push(sub_info, payload)
        if res is True:
            sent_count += 1
        elif res == "expired":
            expired_subs.append(sub)

    # Clean up any subscriptions that the browser revoked or expired
    if expired_subs:
        for exp in expired_subs:
            db.delete(exp)
        db.commit()

    return sent_count


@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Returns the VAPID public key so client browsers can register push subscriptions."""
    return {"public_key": settings.vapid_public_key}


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(
    payload: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Saves or updates a browser Web Push subscription for the logged in user."""
    existing = (
        db.query(NotificationSubscription)
        .filter(NotificationSubscription.endpoint == payload.endpoint)
        .first()
    )

    if existing:
        existing.user_id = current_user.id
        existing.p256dh = payload.keys.p256dh
        existing.auth = payload.keys.auth
        db.commit()
        db.refresh(existing)
        return {"detail": "Subscription updated"}

    sub = NotificationSubscription(
        user_id=current_user.id,
        endpoint=payload.endpoint,
        p256dh=payload.keys.p256dh,
        auth=payload.keys.auth,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"detail": "Subscribed to push notifications"}


@router.post("/unsubscribe")
def unsubscribe(
    payload: UnsubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Removes a browser Web Push subscription."""
    sub = (
        db.query(NotificationSubscription)
        .filter(
            NotificationSubscription.endpoint == payload.endpoint,
            NotificationSubscription.user_id == current_user.id,
        )
        .first()
    )
    if sub:
        db.delete(sub)
        db.commit()
    return {"detail": "Unsubscribed from push notifications"}


@router.post("/check-reminders")
def check_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluates habits and tasks for today and sends push reminders
    if pending items exist.
    """
    today = date.today()
    results = {"habits_sent": False, "tasks_sent": False}

    # 1. Habit Reminder: check active habits not yet marked done today
    active_habits = (
        db.query(Habit)
        .filter(Habit.user_id == current_user.id)
        .all()
    )
    if active_habits:
        completed_today_ids = {
            log.habit_id
            for log in db.query(HabitLog)
            .filter(
                HabitLog.habit_id.in_([h.id for h in active_habits]),
                HabitLog.date == today,
                HabitLog.completed == True,  # noqa: E712
            )
            .all()
        }
        remaining_habits = [h for h in active_habits if h.id not in completed_today_ids]
        count = len(remaining_habits)

        if count > 0:
            habit_payload = {
                "title": "Habit Reminder 🔥",
                "body": f"Don't break your streak! You have {count} habit{'s' if count > 1 else ''} left to complete today.",
                "url": "/habits",
                "tag": "habit-reminder",
            }
            sent = _dispatch_user_push(current_user.id, habit_payload, db)
            results["habits_sent"] = sent > 0
            results["remaining_habits"] = count

    # 2. Task Reminder: check pending tasks scheduled for today or overdue
    pending_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status != "completed",
            Task.date <= today,
        )
        .all()
    )
    task_count = len(pending_tasks)
    if task_count > 0:
        task_payload = {
            "title": "Task Reminder 📋",
            "body": f"You have {task_count} pending task{'s' if task_count > 1 else ''} scheduled for today.",
            "url": "/tasks",
            "tag": "task-reminder",
        }
        sent = _dispatch_user_push(current_user.id, task_payload, db)
        results["tasks_sent"] = sent > 0
        results["pending_tasks"] = task_count

    return results
