# DO-IT Backend — Phase A (Auth Foundation)

## Setup

1. Create a Python virtual environment and activate it:

   **Windows (PowerShell):**
   ```
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

   **Mac/Linux:**
   ```
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and fill in your real `DATABASE_URL`
   (see `NEON_SETUP.md`) and a random `JWT_SECRET`:
   ```
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

4. Create the database tables by running the migration:
   ```
   alembic revision --autogenerate -m "create users and user_preferences"
   alembic upgrade head
   ```

   This connects to Neon using your `DATABASE_URL` and creates the
   `users` and `user_preferences` tables. You can verify they exist
   in the Neon dashboard's SQL editor afterward with:
   ```sql
   SELECT * FROM users;
   ```

5. Run the dev server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

6. Visit `http://localhost:8000/` — you should see
   `{"status": "ok", "service": "do-it-api"}`.

   FastAPI also auto-generates interactive API docs at
   `http://localhost:8000/docs` — this is the fastest way to test
   `/auth/register` and `/auth/login` by hand before wiring the frontend.

## Testing the auth flow manually

In `/docs`:
1. Try `POST /auth/register` with a JSON body like:
   ```json
   {
     "name": "Agniva",
     "username": "agniva",
     "email": "agniva@example.com",
     "password": "testpassword123"
   }
   ```
2. Try `POST /auth/login` with:
   ```json
   { "identifier": "agniva", "password": "testpassword123" }
   ```
3. Try `GET /users/me` — note that Swagger's UI doesn't always forward
   cookies automatically; testing this one end-to-end from the browser
   (where cookies work naturally) or via `curl -b cookies.txt` is more
   reliable than Swagger for this specific endpoint.

## Whenever you add a new model (Phase C onward)

1. Add the model file under `app/models/`.
2. Import it in `alembic/env.py` next to the `user` import, so
   autogenerate can see it.
3. Run `alembic revision --autogenerate -m "add <table>"` then
   `alembic upgrade head`.

## Phase C progress

- **Tasks module**: `tasks` + `task_miss_reasons` tables, full CRUD at
  `/tasks`, `/tasks/{id}/complete`, `/tasks/{id}/miss-reason`. Run:
  ```
  alembic revision --autogenerate -m "add tasks and task_miss_reasons"
  alembic upgrade head
  ```

## Password reset (dev mode)

`/auth/forgot-password` and `/auth/reset-password` are real and working,
but there's no email service wired up yet (that's Phase H). Instead, the
reset link is printed directly to this terminal — watch the console
after calling forgot-password, copy the printed link, and open it in
the browser.

Run the migration for the new token columns:
```
alembic revision --autogenerate -m "add password reset token fields"
alembic upgrade head
```

## Task daily-progress checklist

`tasks` now has a `daily_progress` JSON column (date string → completed
boolean), updated via the existing `PATCH /tasks/{id}` endpoint — no new
route needed. Run:
```
alembic revision --autogenerate -m "add daily_progress to tasks"
alembic upgrade head
```

## Study module

`study_goals` + `study_sessions` tables. Goals: CRUD at `/study/goals`.
Sessions: create/list at `/study/sessions`. Run:
```
alembic revision --autogenerate -m "add study_goals and study_sessions"
alembic upgrade head
```

## Focus module

`focus_sessions` table — create/list only at `/focus/sessions`, no
editing (the frontend only knows a session's outcome once the timer has
already finished). Run:
```
alembic revision --autogenerate -m "add focus_sessions"
alembic upgrade head
```

## Fitness module

`workouts` table (`body_parts` is a JSON list, since one session can
train more than one area). Also adds `GET`/`PATCH /users/me/preferences`
so the fitness goal set at registration is a real, editable setting —
not local component state. Run:
```
alembic revision --autogenerate -m "add workouts"
alembic upgrade head
```

## Habits module

`habits` + `habit_logs` tables (`type`: build/leave). Check-in is an
upsert — one row per habit per day, enforced by a unique constraint, so
toggling the same day twice updates rather than duplicates. Run:
```
alembic revision --autogenerate -m "add habits and habit_logs"
alembic upgrade head
```

## Workout frequency preference

`user_preferences` gains `workout_frequency_type` (daily/weekly/monthly)
and `workout_frequency_count`, both collected at registration and
editable from the Fitness page's goal editor. Run:
```
alembic revision --autogenerate -m "add workout frequency to preferences"
alembic upgrade head
```

## Settings — profile, password, account deletion

No new tables — three new endpoints on the existing `users_router`:
`PATCH /users/me` (profile), `POST /users/me/change-password`, and
`DELETE /users/me` (cascades to every table via the FK constraints
already in place). No migration needed for this one.

## Every page now on real data

Dashboard, Analytics, and Settings — the last three pages that were
still reading mock files — are now wired to real endpoints and
aggregations. The entire MVP is running on Neon end to end.

## Expenses / Budget module (new, beyond original MVP scope)

Three new tables: `budget_months` (one per user per calendar month —
unique constraint enforces this), `budget_categories` (percentage or
fixed-amount allocations), `expenses` (logged spends against a
category). All money math (computed amounts, spent, remaining, percent
used, totals) is calculated server-side in `_build_month_out()` —
never trust client-submitted numbers for anything financial. Run:
```
alembic revision --autogenerate -m "add budget months categories expenses"
alembic upgrade head
```

## Budget: edit/add categories, view logs, delete

No new tables or columns — four new endpoints reusing the existing
schema: `POST /budget/months/{id}/categories` (add one after setup, for
unplanned spending), `PATCH`/`DELETE /budget/categories/{id}`, and
`GET /budget/categories/{id}/expenses` (the per-category log view).
No migration needed for this one.