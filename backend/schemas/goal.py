# backend/schemas/goal.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class GoalFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class GoalCategory(str, Enum):
    ACADEMIC = "academic"
    FITNESS = "fitness"
    WELLNESS = "wellness"
    SLEEP = "sleep"
    MINDFULNESS = "mindfulness"
    NUTRITION = "nutrition"
    SCREENTIME = "screentime"
    CREATIVE = "creative"
    SOCIAL = "social"
    CAREER = "career"
    OTHER = "other"


class HealthMetric(str, Enum):
    """HealthKit metrics that can be auto-tracked on device."""
    STEPS = "steps"
    ACTIVE_CALORIES = "active_calories"
    EXERCISE_MINUTES = "exercise_minutes"
    STAND_HOURS = "stand_hours"
    DISTANCE_WALK_RUN = "distance_walk_run"
    FLIGHTS_CLIMBED = "flights_climbed"
    WORKOUT_COUNT = "workout_count"
    SLEEP_DURATION = "sleep_duration"
    MINDFUL_MINUTES = "mindful_minutes"
    WATER_INTAKE = "water_intake"
    RESTING_HEART_RATE = "resting_heart_rate"
    HRV = "hrv"
    VO2MAX = "vo2max"
    MANUAL = "manual"
    SCREENTIME = "screentime"


# ── Default units per metric (frontend uses these too) ────────────
METRIC_UNITS = {
    "steps": "steps",
    "active_calories": "kcal",
    "exercise_minutes": "min",
    "stand_hours": "hrs",
    "distance_walk_run": "mi",
    "flights_climbed": "flights",
    "workout_count": "workouts",
    "sleep_duration": "hrs",
    "mindful_minutes": "min",
    "water_intake": "fl oz",
    "resting_heart_rate": "bpm",
    "hrv": "ms",
    "vo2max": "mL/kg/min",
    "manual": "times",
    "screentime": "min",
}


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: GoalCategory = GoalCategory.OTHER
    frequency: GoalFrequency = GoalFrequency.DAILY
    target_value: float = 1.0
    target_unit: str = "times"

    # HealthKit integration (new)
    metric: HealthMetric = HealthMetric.MANUAL
    auto_track: bool = False  # True = device reads from HealthKit, logs synced

    # Time-bounded goals (new)
    deadline: Optional[datetime] = None        # optional end date
    total_target: Optional[float] = None       # e.g. "Run 50 miles this month"

    reminder_time: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[GoalCategory] = None
    frequency: Optional[GoalFrequency] = None
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    metric: Optional[HealthMetric] = None
    auto_track: Optional[bool] = None
    deadline: Optional[datetime] = None
    total_target: Optional[float] = None
    reminder_time: Optional[str] = None
    is_active: Optional[bool] = None


class GoalLogCreate(BaseModel):
    goal_id: str
    value: float
    notes: Optional[str] = None
    source: str = "manual"  # "manual", "healthkit", "screentime"


class GoalBulkSync(BaseModel):
    """Batch sync from device — sends all auto-tracked values at once."""
    logs: list["GoalSyncEntry"]


class GoalSyncEntry(BaseModel):
    goal_id: str
    value: float
    date: Optional[str] = None  # ISO date string, defaults to today
    source: str = "healthkit"


class GoalResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: GoalCategory
    frequency: GoalFrequency
    target_value: float
    target_unit: str

    # HealthKit fields
    metric: str = "manual"
    auto_track: bool = False

    # Time-bounded fields
    deadline: Optional[datetime] = None
    total_target: Optional[float] = None
    total_progress: float = 0.0

    reminder_time: Optional[str] = None
    is_active: bool
    current_streak: int
    longest_streak: int
    total_completions: int
    today_progress: float = 0.0
    period_progress: float = 0.0  # for weekly/monthly: progress in current period
    created_at: datetime