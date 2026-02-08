from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import connect_db, close_db
from scheduler.jobs import start_scheduler, stop_scheduler
from routers.auth_router import router as auth_router
from routers.canvas_router import router as canvas_router
from routers.goals_router import router as goals_router
from routers.assignments_router import router as assignments_router
from routers.insights_router import router as insights_router
from routers.services_router import router as services_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    start_scheduler()
    yield
    stop_scheduler()
    await close_db()


app = FastAPI(
    title="Trail API",
    description="Backend for Trail — gentle nudges to keep you on your path 🥾",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(canvas_router)
app.include_router(goals_router)
app.include_router(assignments_router)
app.include_router(insights_router)
app.include_router(services_router)


@app.get("/")
async def root():
    return {"app": "Trail", "status": "running", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
