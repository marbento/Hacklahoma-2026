import httpx
from datetime import datetime
from typing import List, Optional
from config.database import get_db

CANVAS_BASE = "https://canvas.ou.edu"
CANVAS_API = f"{CANVAS_BASE}/api/v1"


async def get_canvas_courses(canvas_token: str) -> List[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{CANVAS_API}/courses",
            headers={"Authorization": f"Bearer {canvas_token}"},
            params={"enrollment_state": "active", "per_page": 50},
        )
        resp.raise_for_status()
        return resp.json()


async def get_canvas_assignments(canvas_token: str, course_id: int) -> List[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{CANVAS_API}/courses/{course_id}/assignments",
            headers={"Authorization": f"Bearer {canvas_token}"},
            params={"order_by": "due_at", "per_page": 50, "bucket": "upcoming"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_canvas_submission(canvas_token: str, course_id: int, assignment_id: int) -> Optional[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{CANVAS_API}/courses/{course_id}/assignments/{assignment_id}/submissions/self",
                headers={"Authorization": f"Bearer {canvas_token}"},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None


async def sync_canvas_assignments(user_id: str, canvas_token: str) -> int:
    db = get_db()
    count = 0
    courses = await get_canvas_courses(canvas_token)

    for course in courses:
        course_id = course.get("id")
        course_name = course.get("name", "Unknown Course")

        try:
            assignments = await get_canvas_assignments(canvas_token, course_id)
        except Exception:
            continue

        for a in assignments:
            if not a.get("due_at"):
                continue

            due_at = datetime.fromisoformat(a["due_at"].replace("Z", "+00:00"))

            submission = await get_canvas_submission(canvas_token, course_id, a["id"])
            grade = None
            status = "upcoming"
            if submission:
                if submission.get("grade"):
                    try:
                        grade = float(submission["grade"])
                        status = "graded"
                    except ValueError:
                        status = "submitted"
                elif submission.get("submitted_at"):
                    status = "submitted"

            await db.assignments.update_one(
                {"user_id": user_id, "canvas_id": a["id"]},
                {
                    "$set": {
                        "user_id": user_id,
                        "canvas_id": a["id"],
                        "course_name": course_name,
                        "course_id": course_id,
                        "title": a.get("name", "Untitled"),
                        "description": a.get("description", ""),
                        "due_at": due_at,
                        "points_possible": a.get("points_possible"),
                        "status": status,
                        "grade": grade,
                        "synced_from_canvas": True,
                        "updated_at": datetime.utcnow(),
                    },
                    "$setOnInsert": {
                        "created_at": datetime.utcnow(),
                        "time_spent_minutes": 0,
                    },
                },
                upsert=True,
            )
            count += 1

    return count
