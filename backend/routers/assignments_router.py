from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from schemas.assignment import AssignmentResponse, AssignmentUpdate
from services.auth_service import get_current_user
from services.canvas_service import sync_canvas_assignments
from services.gemini_service import generate_study_plan

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/", response_model=List[AssignmentResponse])
async def get_assignments(user: dict = Depends(get_current_user)):
    db = get_db()
    assignments = await db.assignments.find({"user_id": user["_id"]}).sort("due_at", 1).to_list(100)
    now = datetime.utcnow()
    return [
        AssignmentResponse(
            id=str(a["_id"]), course_name=a.get("course_name", ""), title=a.get("title", ""),
            description=a.get("description"), due_at=a.get("due_at"), points_possible=a.get("points_possible"),
            status=a.get("status", "upcoming"), grade=a.get("grade"), time_spent_minutes=a.get("time_spent_minutes", 0),
            study_plan=a.get("study_plan"), days_until_due=max(0, (a["due_at"] - now).days) if a.get("due_at") else None,
        )
        for a in assignments
    ]


@router.post("/sync-canvas")
async def sync_from_canvas(user: dict = Depends(get_current_user)):
    token = user.get("canvas_api_token")
    if not token:
        raise HTTPException(status_code=400, detail="No Canvas API token configured. Connect Canvas in Profile first.")
    count = await sync_canvas_assignments(user["_id"], token)
    return {"synced": count, "message": f"Synced {count} assignments from Canvas"}


@router.post("/{assignment_id}/study-plan")
async def create_study_plan(assignment_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        obj_id = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID format")

    assignment = await db.assignments.find_one({"_id": obj_id, "user_id": user["_id"]})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    plan = await generate_study_plan(
        assignment_title=assignment["title"], course_name=assignment.get("course_name", ""),
        description=assignment.get("description", ""), points_possible=assignment.get("points_possible"),
        due_at=assignment.get("due_at"),
    )
    plan.assignment_id = assignment_id
    await db.assignments.update_one(
        {"_id": obj_id}, {"$set": {"study_plan": plan.model_dump(), "updated_at": datetime.utcnow()}},
    )
    return plan


@router.put("/{assignment_id}")
async def update_assignment(assignment_id: str, update: AssignmentUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        obj_id = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID format")

    result = await db.assignments.update_one(
        {"_id": obj_id, "user_id": user["_id"]},
        {"$set": {**update.model_dump(exclude_none=True), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment updated"}


@router.post("/{assignment_id}/log-time")
async def log_study_time(assignment_id: str, minutes: int, user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        obj_id = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID format")

    result = await db.assignments.update_one(
        {"_id": obj_id, "user_id": user["_id"]},
        {"$inc": {"time_spent_minutes": minutes}, "$set": {"status": "in_progress", "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": f"Logged {minutes} minutes"}
