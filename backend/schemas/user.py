from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    name: str


class UserInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: str
    name: str
    canvas_api_token: Optional[str] = None
    canvas_refresh_token: Optional[str] = None
    canvas_connected: bool = False
    canvas_user_name: Optional[str] = None
    canvas_email: Optional[str] = None
    canvas_courses_count: int = 0
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None
    google_email: Optional[str] = None
    elevenlabs_voice_pref: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    has_canvas: bool = False
    has_google: bool = False
    created_at: datetime
