from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from config.database import get_db
from services.canvas_service import sync_canvas_assignments

scheduler = AsyncIOScheduler()


async def sync_all_canvas():
    db = get_db()
    users = await db.users.find({"canvas_api_token": {"$ne": None}}).to_list(1000)
    for user in users:
        try:
            count = await sync_canvas_assignments(str(user["_id"]), user["canvas_api_token"])
            print(f"Synced {count} assignments for {user.get('name', user['_id'])}")
        except Exception as e:
            print(f"Canvas sync failed for {user['_id']}: {e}")


async def reset_daily_streaks():
    db = get_db()
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    goals = await db.goals.find({"is_active": True, "frequency": "daily"}).to_list(10000)
    for g in goals:
        logs = await db.goal_logs.find({
            "goal_id": str(g["_id"]),
            "date": {"$gte": datetime.strptime(yesterday, "%Y-%m-%d"), "$lt": datetime.strptime(yesterday, "%Y-%m-%d") + timedelta(days=1)},
        }).to_list(100)
        if sum(l.get("value", 0) for l in logs) < g.get("target_value", 1):
            await db.goals.update_one({"_id": g["_id"]}, {"$set": {"current_streak": 0}})


async def check_assignment_reminders():
    db = get_db()
    tomorrow = datetime.utcnow() + timedelta(hours=24)
    urgent = await db.assignments.find({"due_at": {"$lte": tomorrow, "$gte": datetime.utcnow()}, "status": "upcoming", "time_spent_minutes": 0}).to_list(1000)
    for a in urgent:
        await db.assignments.update_one({"_id": a["_id"]}, {"$set": {"urgent": True}})
    print(f"Flagged {len(urgent)} urgent assignments")


def start_scheduler():
    scheduler.add_job(sync_all_canvas, "interval", hours=2, id="canvas_sync")
    scheduler.add_job(reset_daily_streaks, "cron", hour=0, minute=5, id="streak_reset")
    scheduler.add_job(check_assignment_reminders, "interval", hours=6, id="assignment_reminders")
    scheduler.start()
    print("Scheduler started: canvas_sync(2h), streak_reset(midnight), reminders(6h)")


def stop_scheduler():
    scheduler.shutdown()
