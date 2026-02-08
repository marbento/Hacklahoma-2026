from fastapi import APIRouter, Depends
from services.auth_service import get_current_user

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/status")
async def get_services_status(user: dict = Depends(get_current_user)):
    return {
        "canvas": {
            "connected": bool(user.get("canvas_connected")),
            "user_name": user.get("canvas_user_name"),
            "email": user.get("canvas_email"),
            "courses_count": user.get("canvas_courses_count", 0),
            "institution": "University of Oklahoma",
        },
        "google_calendar": {
            "connected": bool(user.get("google_access_token")),
            "email": user.get("google_email"),
        },
        "elevenlabs": {"connected": True},
        "gemini": {"connected": True},
    }
