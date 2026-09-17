from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User, UserPreferences
from app.schemas.auth_schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user_schemas import (
    ChangePasswordRequest,
    UserCreate,
    UserOut,
    UserPreferencesOut,
    UserPreferencesUpdate,
    UserUpdate,
)
from app.utils.deps import get_current_user
from app.utils.email import send_password_reset_email
from app.utils.security import (
    create_access_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)

RESET_TOKEN_VALID_MINUTES = 30

router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])

COOKIE_MAX_AGE = settings.access_token_expire_minutes * 60


def _set_auth_cookie(response: Response, token: str) -> None:
    # httpOnly + secure per the blueprint's security requirements —
    # never store the token in localStorage on the frontend.
    # In cross-domain deployments (e.g. frontend on vercel.app, backend on onrender.com),
    # browsers strictly require SameSite="none" and Secure=True for cross-origin cookies to be sent.
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=COOKIE_MAX_AGE,
        expires=COOKIE_MAX_AGE,
    )



@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    # Checked individually (not one combined OR query) so the error can
    # tell the person exactly which field is the problem, rather than a
    # generic "something's taken" that leaves them guessing.
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "email already registered")

    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "username already registered")

    if payload.whatsapp_number and db.query(User).filter(
        User.whatsapp_number == payload.whatsapp_number
    ).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "whatsapp_number already registered")

    user = User(
        name=payload.name,
        username=payload.username,
        email=payload.email,
        whatsapp_number=payload.whatsapp_number,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()  # get user.id before creating preferences

    db.add(
        UserPreferences(
            user_id=user.id,
            gender=payload.gender,
            fitness_goal=payload.fitness_goal,
            workout_frequency_type=payload.workout_frequency_type,
            workout_frequency_count=payload.workout_frequency_count,
        )
    )
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    _set_auth_cookie(response, token)
    return user


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    from sqlalchemy import or_

    user = (
        db.query(User)
        .filter(
            or_(User.email == payload.identifier, User.username == payload.identifier)
        )
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    token = create_access_token(str(user.id))
    _set_auth_cookie(response, token)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
    )
    return {"detail": "Logged out"}



@users_router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return the same generic response whether or not the email
    # exists — this endpoint should never reveal which emails are
    # registered. The actual token only ever appears in the next block,
    # printed server-side, never in the HTTP response.
    if user:
        raw_token, token_hash = generate_reset_token()
        user.reset_token_hash = token_hash
        user.reset_token_expires = datetime.utcnow() + timedelta(
            minutes=RESET_TOKEN_VALID_MINUTES
        )
        db.commit()

        # Determine the user's frontend URL:
        # 1. Prefer the Origin or Referer header sent by the client browser
        req_origin = request.headers.get("origin")
        if not req_origin and request.headers.get("referer"):
            # Extract scheme + netloc from referer
            from urllib.parse import urlparse
            ref = urlparse(request.headers.get("referer"))
            if ref.scheme and ref.netloc:
                req_origin = f"{ref.scheme}://{ref.netloc}"

        if req_origin and req_origin.startswith("http") and "localhost" not in req_origin:
            base_origin = req_origin
        else:
            # 2. Check allowed_origins for a production (non-localhost) https address
            prod_origin = next(
                (o for o in settings.allowed_origins if o.startswith("https://") and "localhost" not in o and "127.0.0.1" not in o),
                None
            )
            base_origin = prod_origin or req_origin or "https://do-it-web.vercel.app"

        base_origin = base_origin.rstrip("/")
        reset_link = f"{base_origin}/reset-password?token={raw_token}"

        email_sent = send_password_reset_email(user.email, reset_link)
        if not email_sent:
            # Fallback for dev / when SMTP is not yet configured
            print("\n" + "=" * 60)
            print(f"PASSWORD RESET LINK for {user.email}:")
            print(reset_link)
            print(f"(valid for {RESET_TOKEN_VALID_MINUTES} minutes)")
            print("=" * 60 + "\n")

    return {
        "detail": "If that email is registered, a reset link has been sent to your inbox."
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hash_reset_token(payload.token)
    user = db.query(User).filter(User.reset_token_hash == token_hash).first()

    if (
        not user
        or not user.reset_token_expires
        or user.reset_token_expires < datetime.utcnow()
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user.password_hash = hash_password(payload.new_password)
    user.reset_token_hash = None
    user.reset_token_expires = None
    db.commit()

    return {"detail": "Password updated. You can now log in."}


@users_router.get("/me/preferences", response_model=UserPreferencesOut)
def read_preferences(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return current_user.preferences


@users_router.patch("/me/preferences", response_model=UserPreferencesOut)
def update_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = current_user.preferences
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(prefs, key, value)
    db.commit()
    db.refresh(prefs)
    return prefs


@users_router.patch("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)

    # Same per-field uniqueness checks as registration — email/username/
    # whatsapp must stay unique, and the error should say which field is
    # the problem rather than a generic conflict message.
    if "email" in updates and updates["email"] != current_user.email:
        if db.query(User).filter(User.email == updates["email"]).first():
            raise HTTPException(status.HTTP_409_CONFLICT, "email already registered")
    if "username" in updates and updates["username"] != current_user.username:
        if db.query(User).filter(User.username == updates["username"]).first():
            raise HTTPException(status.HTTP_409_CONFLICT, "username already registered")
    if updates.get("whatsapp_number") and updates["whatsapp_number"] != current_user.whatsapp_number:
        if db.query(User).filter(User.whatsapp_number == updates["whatsapp_number"]).first():
            raise HTTPException(
                status.HTTP_409_CONFLICT, "whatsapp_number already registered"
            )

    for key, value in updates.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@users_router.post("/me/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated."}


@users_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(current_user)  # cascades to preferences, tasks, everything else
    db.commit()
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
    )