from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from config.database import get_db
from schemas.goal import GoalCreate, GoalUpdate, GoalLogCreate, GoalResponse
from services.auth_service import get_current_user
import uuid

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=List[GoalResponse])
async def get_goals(user: dict = Depends(get_current_user)):
    db = get_db()
    goals = await db.goals.find({"user_id": user["_id"], "is_active": True}).to_list(100)
    results = []
    today = datetime.utcnow().strftime("%Y-%m-%d")
    for g in goals:
        logs = await db.goal_logs.find({"goal_id": str(g["_id"]), "date": {"$gte": datetime.strptime(today, "%Y-%m-%d")}}).to_list(100)
        today_value = sum(log.get("value", 0) for log in logs)
        results.append(GoalResponse(
            id=str(g["_id"]), title=g["title"], description=g.get("description"),
            category=g.get("category", "other"), frequency=g.get("frequency", "daily"),
            target_value=g.get("target_value", 1), target_unit=g.get("target_unit", "times"),
            reminder_time=g.get("reminder_time"), is_active=g.get("is_active", True),
            current_streak=g.get("current_streak", 0), longest_streak=g.get("longest_streak", 0),
            total_completions=g.get("total_completions", 0), today_progress=today_value,
            created_at=g.get("created_at", datetime.utcnow()),
        ))
    return results


@router.post("/")
async def create_goal(goal: GoalCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    goal_id = str(uuid.uuid4())
    await db.goals.insert_one({
        "_id": goal_id, "user_id": user["_id"], **goal.model_dump(),
        "is_active": True, "current_streak": 0, "longest_streak": 0, "total_completions": 0,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow(),
    })
    return {"id": goal_id, "message": "Goal created"}


@router.put("/{goal_id}")
async def update_goal(goal_id: str, update: GoalUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.goals.update_one(
        {"_id": goal_id, "user_id": user["_id"]},
        {"$set": {**update.model_dump(exclude_none=True), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal updated"}


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    await db.goals.update_one({"_id": goal_id, "user_id": user["_id"]}, {"$set": {"is_active": False}})
    return {"message": "Goal deactivated"}


@router.post("/log")
async def log_goal_progress(log: GoalLogCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    goal = await db.goals.find_one({"_id": log.goal_id, "user_id": user["_id"]})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    log_id = str(uuid.uuid4())
    await db.goal_logs.insert_one({
        "_id": log_id, "user_id": user["_id"], "goal_id": log.goal_id,
        "value": log.value, "notes": log.notes, "date": datetime.utcnow(),
    })

    today = datetime.utcnow().strftime("%Y-%m-%d")
    logs_today = await db.goal_logs.find({"goal_id": log.goal_id, "date": {"$gte": datetime.strptime(today, "%Y-%m-%d")}}).to_list(100)
    total_today = sum(l.get("value", 0) for l in logs_today)

    if total_today >= goal.get("target_value", 1):
        new_streak = goal.get("current_streak", 0) + 1
        longest = max(new_streak, goal.get("longest_streak", 0))
        await db.goals.update_one(
            {"_id": log.goal_id},
            {"$set": {"current_streak": new_streak, "longest_streak": longest}, "$inc": {"total_completions": 1}},
        )

    return {"id": log_id, "today_total": total_today, "target": goal.get("target_value", 1), "met": total_today >= goal.get("target_value", 1)}
