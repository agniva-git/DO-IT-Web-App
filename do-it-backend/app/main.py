from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router, users_router
from app.api.tasks import router as tasks_router
from app.api.study import router as study_router
from app.api.focus import router as focus_router
from app.api.fitness import router as fitness_router
from app.api.habits import router as habits_router
from app.api.budget import router as budget_router
from app.core.config import settings

app = FastAPI(title="DO-IT API", version="0.1.0")

# CORS locked to the frontend's origin, with credentials allowed since
# auth uses an httpOnly cookie rather than a bearer header.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(study_router)
app.include_router(focus_router)
app.include_router(fitness_router)
app.include_router(habits_router)
app.include_router(budget_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "do-it-api"}