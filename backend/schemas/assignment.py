from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AssignmentStatus(str, Enum):
    UPCOMING = "upcoming"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"
    MISSED = "missed"


class SubTask(BaseModel):
    title: str
    description: str
    estimated_minutes: int
    resources: List[str] = []
    is_completed: bool = False


class StudyPlan(BaseModel):
    assignment_id: str
    estimated_total_minutes: int
    key_concepts: List[str] = []
    subtasks: List[SubTask] = []
    encouragement: str = ""
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class AssignmentInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    canvas_id: Optional[int] = None
    course_name: str = ""
    course_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    points_possible: Optional[float] = None
    status: AssignmentStatus = AssignmentStatus.UPCOMING
    grade: Optional[float] = None
    grade_letter: Optional[str] = None
    time_spent_minutes: int = 0
    study_plan: Optional[StudyPlan] = None
    synced_from_canvas: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AssignmentUpdate(BaseModel):
    status: Optional[AssignmentStatus] = None
    grade: Optional[float] = None
    grade_letter: Optional[str] = None
    time_spent_minutes: Optional[int] = None


class AssignmentResponse(BaseModel):
    id: str
    course_name: str
    title: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    points_possible: Optional[float] = None
    status: AssignmentStatus
    grade: Optional[float] = None
    time_spent_minutes: int
    study_plan: Optional[StudyPlan] = None
    days_until_due: Optional[int] = None
