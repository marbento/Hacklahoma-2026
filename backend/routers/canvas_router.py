from fastapi import APIRouter, HTTPException, Depends
import httpx
from datetime import datetime
from config.database import get_db
from services.auth_service import get_current_user

router = APIRouter(prefix="/canvas", tags=["canvas"])

CANVAS_BASE = "https://canvas.ou.edu"
CANVAS_API = f"{CANVAS_BASE}/api/v1"


@router.post("/validate-token")
async def validate_and_save_token(token: str, user: dict = Depends(get_current_user)):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{CANVAS_API}/users/self/profile", headers={"Authorization": f"Bearer {token}"})
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Could not reach canvas.ou.edu")

    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid Canvas token.")
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Canvas API error: {resp.status_code}")

    profile = resp.json()
    canvas_name = profile.get("name", "OU Student")
    canvas_email = profile.get("primary_email", "")

    # Fetch courses
    course_names = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            cr = await client.get(f"{CANVAS_API}/courses", headers={"Authorization": f"Bearer {token}"}, params={"enrollment_state": "active", "per_page": 50})
            courses = cr.json() if cr.status_code == 200 else []
            course_names = [c.get("name", "Unknown") for c in courses if isinstance(c, dict) and c.get("name")]
        except Exception:
            pass

    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "canvas_api_token": token, "canvas_connected": True,
            "canvas_user_name": canvas_name, "canvas_email": canvas_email,
            "canvas_courses_count": len(course_names), "updated_at": datetime.utcnow(),
        }},
    )
    return {"valid": True, "canvas_name": canvas_name, "canvas_email": canvas_email, "courses": course_names, "courses_count": len(course_names)}


@router.get("/status")
async def canvas_status(user: dict = Depends(get_current_user)):
    return {
        "connected": bool(user.get("canvas_connected")),
        "canvas_name": user.get("canvas_user_name"),
        "canvas_email": user.get("canvas_email"),
        "courses_count": user.get("canvas_courses_count", 0),
    }


@router.delete("/disconnect")
async def disconnect_canvas(user: dict = Depends(get_current_user)):
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"canvas_api_token": None, "canvas_connected": False, "canvas_user_name": None, "canvas_email": None, "canvas_courses_count": 0}},
    )
    return {"message": "Canvas disconnected"}
