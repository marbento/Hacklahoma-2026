from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class DailyProgress(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    date: str
    goals_completed: int = 0
    goals_total: int = 0
    assignments_worked: int = 0
    study_minutes: int = 0
    screen_time_blocked_minutes: int = 0
    mood: Optional[str] = None
    highlights: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WeeklyReport(BaseModel):
    user_id: str
    week_start: str
    week_end: str
    goals_completion_rate: float = 0.0
    total_study_minutes: int = 0
    assignments_completed: int = 0
    assignments_graded: int = 0
    average_grade: Optional[float] = None
    screen_time_saved_minutes: int = 0
    streaks: Dict[str, int] = {}
    top_achievement: Optional[str] = None
    encouragement: str = ""
    areas_for_growth: List[str] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class MonthlyReport(BaseModel):
    user_id: str
    month: str
    goals_completion_rate: float = 0.0
    total_study_hours: float = 0.0
    assignments_completed: int = 0
    gpa_trend: Optional[str] = None
    longest_streak: int = 0
    total_screen_time_saved_hours: float = 0.0
    narrative: str = ""
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class NudgeData(BaseModel):
    title: str
    subtitle: str
    current_goal: Optional[str] = None
    upcoming_assignment: Optional[str] = None
    assignment_due: Optional[str] = None
    redirect_links: List[Dict[str, str]] = []
    encouragement: str = ""
