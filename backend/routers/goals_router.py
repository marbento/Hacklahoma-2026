# backend/routers/goals_router.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timedelta
from config.database import get_db
from schemas.goal import (
    GoalCreate, GoalUpdate, GoalLogCreate, GoalBulkSync,
    GoalResponse, METRIC_UNITS,
)
from services.auth_service import get_current_user
import uuid

router = APIRouter(prefix="/goals", tags=["goals"])


# ── Helpers ───────────────────────────────────────────────────────

def _period_start(frequency: str, now: datetime) -> datetime:
    """Get the start of the current period for a goal frequency."""
    if frequency == "weekly":
        # Monday of this week
        return (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    elif frequency == "monthly":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # daily
        return now.replace(hour=0, minute=0, second=0, microsecond=0)


async def _compute_progress(db, goal: dict, now: datetime) -> dict:
    """Compute today_progress, period_progress, and total_progress for a goal."""
    goal_id = str(goal["_id"])
    frequency = goal.get("frequency", "daily")

    # Today's progress
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    logs_today = await db.goal_logs.find({
        "goal_id": goal_id,
        "date": {"$gte": today_start},
    }).to_list(500)
    today_value = sum(log.get("value", 0) for log in logs_today)

    # Period progress (for weekly/monthly goals)
    period_start = _period_start(frequency, now)
    if frequency != "daily":
        logs_period = await db.goal_logs.find({
            "goal_id": goal_id,
            "date": {"$gte": period_start},
        }).to_list(1000)
        period_value = sum(log.get("value", 0) for log in logs_period)
    else:
        period_value = today_value

    # Total progress (for time-bounded goals with total_target)
    total_value = 0.0
    if goal.get("total_target"):
        logs_all = await db.goal_logs.find({"goal_id": goal_id}).to_list(10000)
        total_value = sum(log.get("value", 0) for log in logs_all)

    return {
        "today_progress": today_value,
        "period_progress": period_value,
        "total_progress": total_value,
    }


# ── Routes ────────────────────────────────────────────────────────

@router.get("/", response_model=List[GoalResponse])
async def get_goals(user: dict = Depends(get_current_user)):
    db = get_db()
    goals = await db.goals.find({
        "user_id": user["_id"], "is_active": True,
    }).to_list(100)

    now = datetime.utcnow()
    results = []

    for g in goals:
        progress = await _compute_progress(db, g, now)

        results.append(GoalResponse(
            id=str(g["_id"]),
            title=g["title"],
            description=g.get("description"),
            category=g.get("category", "other"),
            frequency=g.get("frequency", "daily"),
            target_value=g.get("target_value", 1),
            target_unit=g.get("target_unit", "times"),
            metric=g.get("metric", "manual"),
            auto_track=g.get("auto_track", False),
            deadline=g.get("deadline"),
            total_target=g.get("total_target"),
            total_progress=progress["total_progress"],
            reminder_time=g.get("reminder_time"),
            is_active=g.get("is_active", True),
            current_streak=g.get("current_streak", 0),
            longest_streak=g.get("longest_streak", 0),
            total_completions=g.get("total_completions", 0),
            today_progress=progress["today_progress"],
            period_progress=progress["period_progress"],
            created_at=g.get("created_at", datetime.utcnow()),
        ))

    return results


@router.post("/")
async def create_goal(goal: GoalCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    goal_id = str(uuid.uuid4())

    # Auto-set unit from metric if not provided
    data = goal.model_dump()
    if goal.metric.value != "manual" and goal.target_unit == "times":
        data["target_unit"] = METRIC_UNITS.get(goal.metric.value, "times")

    # Auto-set category from metric if left as OTHER
    if goal.category.value == "other" and goal.metric.value != "manual":
        metric = goal.metric.value
        if metric in ("steps", "active_calories", "exercise_minutes", "distance_walk_run",
                       "flights_climbed", "workout_count"):
            data["category"] = "fitness"
        elif metric == "sleep_duration":
            data["category"] = "sleep"
        elif metric == "mindful_minutes":
            data["category"] = "mindfulness"
        elif metric == "water_intake":
            data["category"] = "nutrition"
        elif metric == "screentime":
            data["category"] = "screentime"
        elif metric in ("resting_heart_rate", "hrv", "vo2max"):
            data["category"] = "wellness"

    await db.goals.insert_one({
        "_id": goal_id,
        "user_id": user["_id"],
        **data,
        "is_active": True,
        "current_streak": 0,
        "longest_streak": 0,
        "total_completions": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
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
    await db.goals.update_one(
        {"_id": goal_id, "user_id": user["_id"]},
        {"$set": {"is_active": False}},
    )
    return {"message": "Goal deactivated"}


@router.post("/log")
async def log_goal_progress(log: GoalLogCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    goal = await db.goals.find_one({"_id": log.goal_id, "user_id": user["_id"]})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Prevent manual logging of sleep goals (must come from HealthKit)
    if goal.get("metric") == "sleep_duration" and log.source == "manual":
        raise HTTPException(
            status_code=400,
            detail="Sleep goals cannot be manually logged. They must be synced from HealthKit."
        )

    log_id = str(uuid.uuid4())
    await db.goal_logs.insert_one({
        "_id": log_id,
        "user_id": user["_id"],
        "goal_id": log.goal_id,
        "value": log.value,
        "notes": log.notes,
        "source": log.source,
        "date": datetime.utcnow(),
    })

    # Check if target met for current period
    now = datetime.utcnow()
    frequency = goal.get("frequency", "daily")
    period_start = _period_start(frequency, now)

    logs_period = await db.goal_logs.find({
        "goal_id": log.goal_id,
        "date": {"$gte": period_start},
    }).to_list(1000)
    total_period = sum(l.get("value", 0) for l in logs_period)

    target = goal.get("target_value", 1)
    met = total_period >= target

    if met:
        new_streak = goal.get("current_streak", 0) + 1
        longest = max(new_streak, goal.get("longest_streak", 0))
        await db.goals.update_one(
            {"_id": log.goal_id},
            {
                "$set": {"current_streak": new_streak, "longest_streak": longest},
                "$inc": {"total_completions": 1},
            },
        )

    return {
        "id": log_id,
        "today_total": total_period if frequency == "daily" else total_period,
        "period_total": total_period,
        "target": target,
        "met": met,
    }


@router.post("/sync")
async def bulk_sync_progress(sync: GoalBulkSync, user: dict = Depends(get_current_user)):
    """Batch sync from device — the app sends all HealthKit values at once.

    For auto_track goals, this replaces today's value (upsert) rather than
    accumulating, because HealthKit already gives the cumulative daily total.
    """
    db = get_db()
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    results = []

    for entry in sync.logs:
        goal = await db.goals.find_one({"_id": entry.goal_id, "user_id": user["_id"]})
        if not goal:
            results.append({"goal_id": entry.goal_id, "error": "not found"})
            continue

        log_date = today_start
        if entry.date:
            try:
                log_date = datetime.fromisoformat(entry.date.replace("Z", "+00:00"))
                log_date = log_date.replace(hour=0, minute=0, second=0, microsecond=0)
            except ValueError:
                log_date = today_start

        if goal.get("auto_track"):
            # Upsert: replace today's HealthKit log (not accumulate)
            existing = await db.goal_logs.find_one({
                "goal_id": entry.goal_id,
                "source": "healthkit",
                "date": {"$gte": log_date, "$lt": log_date + timedelta(days=1)},
            })

            if existing:
                await db.goal_logs.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"value": entry.value, "updated_at": now}},
                )
                log_id = str(existing["_id"])
            else:
                log_id = str(uuid.uuid4())
                await db.goal_logs.insert_one({
                    "_id": log_id,
                    "user_id": user["_id"],
                    "goal_id": entry.goal_id,
                    "value": entry.value,
                    "source": "healthkit",
                    "date": log_date,
                })
        else:
            # Non-auto: just add a log
            log_id = str(uuid.uuid4())
            await db.goal_logs.insert_one({
                "_id": log_id,
                "user_id": user["_id"],
                "goal_id": entry.goal_id,
                "value": entry.value,
                "source": entry.source,
                "date": log_date,
            })

        # Check streak
        frequency = goal.get("frequency", "daily")
        period_start = _period_start(frequency, now)
        logs_period = await db.goal_logs.find({
            "goal_id": entry.goal_id,
            "date": {"$gte": period_start},
        }).to_list(1000)
        total_period = sum(l.get("value", 0) for l in logs_period)
        target = goal.get("target_value", 1)

        if total_period >= target:
            new_streak = goal.get("current_streak", 0) + 1
            longest = max(new_streak, goal.get("longest_streak", 0))
            await db.goals.update_one(
                {"_id": entry.goal_id},
                {
                    "$set": {"current_streak": new_streak, "longest_streak": longest},
                    "$inc": {"total_completions": 1},
                },
            )

        results.append({
            "goal_id": entry.goal_id,
            "log_id": log_id,
            "period_total": total_period,
            "target": target,
            "met": total_period >= target,
        })

    return {"synced": len(results), "results": results}


@router.get("/history/{goal_id}")
async def get_goal_history(goal_id: str, days: int = 7, user: dict = Depends(get_current_user)):
    """
    Get historical completion data for a goal.

    Args:
        goal_id: Goal ID
        days: Number of days to look back (default 7)
    """
    db = get_db()
    goal = await db.goals.find_one({"_id": goal_id, "user_id": user["_id"]})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Get logs for the past N days
    lookback_date = datetime.utcnow() - timedelta(days=days)
    logs = await db.goal_logs.find({
        "goal_id": goal_id,
        "date": {"$gte": lookback_date},
    }).sort("date", 1).to_list(1000)

    # Group by date
    daily_data = {}
    for log in logs:
        date_key = log["date"].strftime("%Y-%m-%d")
        if date_key not in daily_data:
            daily_data[date_key] = {
                "date": date_key,
                "value": 0,
                "logs_count": 0,
                "completed": False
            }
        daily_data[date_key]["value"] += log.get("value", 0)
        daily_data[date_key]["logs_count"] += 1

    # Check completion status
    target = goal.get("target_value", 1)
    for data in daily_data.values():
        data["completed"] = data["value"] >= target

    # Convert to list and sort
    history = sorted(daily_data.values(), key=lambda x: x["date"])

    return {
        "goal_id": goal_id,
        "title": goal["title"],
        "target_value": target,
        "target_unit": goal.get("target_unit", "times"),
        "days": days,
        "history": history
    }


@router.get("/completed-today")
async def get_completed_goals_today(user: dict = Depends(get_current_user)):
    """
    Get all goals completed today with their completion details.
    Used for the 'Completed Tasks' feed.
    """
    db = get_db()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Get all active goals
    goals = await db.goals.find({
        "user_id": user["_id"],
        "is_active": True
    }).to_list(100)

    completed_today = []

    for goal in goals:
        goal_id = str(goal["_id"])

        # Get today's logs for this goal
        logs = await db.goal_logs.find({
            "goal_id": goal_id,
            "date": {"$gte": today_start}
        }).sort("date", -1).to_list(100)

        # Sum progress
        progress = sum(log.get("value", 0) for log in logs)
        target = goal.get("target_value", 1)

        # If completed, add to list
        if progress >= target:
            # Get the timestamp of completion (last log that pushed over target)
            completed_at = logs[-1]["date"] if logs else today_start

            completed_today.append({
                "id": goal_id,
                "title": goal["title"],
                "category": goal.get("category", "other"),
                "points": 3,  # Each completed goal = 3 steps
                "completed_at": completed_at.isoformat(),
                "progress": progress,
                "target": target,
                "unit": goal.get("target_unit", "times")
            })

    # Sort by completion time (most recent first)
    completed_today.sort(key=lambda x: x["completed_at"], reverse=True)

    return {
        "date": today_start.strftime("%Y-%m-%d"),
        "completed_count": len(completed_today),
        "total_steps": len(completed_today) * 3,
        "goals": completed_today
    }