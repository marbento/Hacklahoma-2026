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
    CREATIVE = "creative"
    SOCIAL = "social"
    CAREER = "career"
    OTHER = "other"


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: GoalCategory = GoalCategory.OTHER
    frequency: GoalFrequency = GoalFrequency.DAILY
    target_value: float = 1.0
    target_unit: str = "times"
    reminder_time: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[GoalCategory] = None
    frequency: Optional[GoalFrequency] = None
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    reminder_time: Optional[str] = None
    is_active: Optional[bool] = None


class GoalLogCreate(BaseModel):
    goal_id: str
    value: float
    notes: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: GoalCategory
    frequency: GoalFrequency
    target_value: float
    target_unit: str
    reminder_time: Optional[str] = None
    is_active: bool
    current_streak: int
    longest_streak: int
    total_completions: int
    today_progress: float = 0.0
    created_at: datetime
