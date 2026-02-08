"""Development-only routes for seeding demo data"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from passlib.context import CryptContext
from config.database import get_db
from config.settings import get_settings

router = APIRouter(prefix="/dev", tags=["development"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


@router.post("/seed-mock-user")
async def seed_mock_user():
    """Create Avery Park demo user with 3 days of history"""

    # Only allow in development
    if settings.app_env == "production":
        raise HTTPException(status_code=403, detail="Not available in production")

    db = get_db()

    # 1. Create user account
    user_data = {
        "email": "avery.park@demo.com",
        "password_hash": pwd_context.hash("demo123"),
        "name": "Avery Park",
        "created_at": datetime(2026, 2, 5, 12, 0, 0),
        "canvas_api_token": None,
        "google_calendar_token": None,
        "settings": {
            "bedtime_start": "22:00",
            "bedtime_end": "07:00",
            "blocked_apps": ["Instagram", "YouTube", "Reddit", "TikTok"],
            "notifications_enabled": True,
        },
    }

    # Delete existing mock user
    await db.users.delete_one({"email": "avery.park@demo.com"})
    result = await db.users.insert_one(user_data)
    user_id = str(result.inserted_id)

    # 2. Create goals
    goals_data = [
        {
            "user_id": user_id,
            "title": "Study 3 hours daily",
            "description": "Focus on coursework",
            "category": "academic",
            "frequency": "daily",
            "target_value": 180.0,
            "target_unit": "min",
            "metric": "manual",
            "auto_track": False,
            "is_active": True,
            "current_streak": 3,
            "longest_streak": 5,
            "total_completions": 3,
            "created_at": datetime(2026, 2, 5, 12, 0, 0),
        },
        {
            "user_id": user_id,
            "title": "Morning workout",
            "description": "30 min exercise",
            "category": "fitness",
            "frequency": "daily",
            "target_value": 30.0,
            "target_unit": "min",
            "metric": "exercise_minutes",
            "auto_track": True,
            "is_active": True,
            "current_streak": 2,
            "longest_streak": 7,
            "total_completions": 2,
            "created_at": datetime(2026, 2, 5, 12, 0, 0),
        },
        {
            "user_id": user_id,
            "title": "Sleep 8 hours",
            "description": "Quality rest",
            "category": "sleep",
            "frequency": "daily",
            "target_value": 8.0,
            "target_unit": "hrs",
            "metric": "sleep_duration",
            "auto_track": True,
            "is_active": True,
            "current_streak": 3,
            "longest_streak": 10,
            "total_completions": 3,
            "created_at": datetime(2026, 2, 5, 12, 0, 0),
        },
    ]

    await db.goals.delete_many({"user_id": user_id})
    inserted_goals = await db.goals.insert_many(goals_data)
    goal_ids = [str(gid) for gid in inserted_goals.inserted_ids]

    # 3. Create goal logs (track completions for each day)
    # Feb 6: 1 task completed (study goal: 83 min < 180 min target, NOT completed)
    # Feb 7: 1 task completed (study goal: 192 min > 180 min target, COMPLETED)
    # Feb 8: 1 task completed (study goal: 96 min < 180 min target, NOT completed)
    # BUT we track the progress regardless
    goal_logs = [
        # Feb 6 - Study session (didn't hit 180 min target)
        {
            "user_id": user_id,
            "goal_id": goal_ids[0],
            "value": 83.0,  # 42 + 41 min productive
            "date": datetime(2026, 2, 6, 16, 0, 0),
            "source": "manual",
            "notes": "Notion + Calendar work",
        },
        # Feb 7 - Study session (HIT 180 min target!)
        {
            "user_id": user_id,
            "goal_id": goal_ids[0],
            "value": 192.0,  # 60 + 72 + 60 min productive
            "date": datetime(2026, 2, 7, 18, 0, 0),
            "source": "manual",
            "notes": "Notion + Canvas + Microsoft 365",
        },
        # Feb 8 TODAY - Study session (didn't hit 180 min target)
        {
            "user_id": user_id,
            "goal_id": goal_ids[0],
            "value": 96.0,  # 35 + 25 + 36 min productive
            "date": datetime(2026, 2, 8, 17, 0, 0),
            "source": "manual",
            "notes": "Notion + Calendar + Canvas",
        },
    ]

    await db.goal_logs.delete_many({"user_id": user_id})
    await db.goal_logs.insert_many(goal_logs)

    # 4. Create screen time logs
    screen_time_logs = []

    # Feb 6
    for hour, minute, app, mins, productive in [
        (9, 5, "Notion", 42, True),
        (10, 20, "Google Calendar", 41, True),
        (14, 10, "Instagram", 18, False),
        (16, 40, "YouTube", 18, False),
    ]:
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": app,
            "category": "productivity" if productive else "entertainment",
            "duration_minutes": mins,
            "is_productive": productive,
            "timestamp": datetime(2026, 2, 6, hour, minute, 0),
            "date": datetime(2026, 2, 6, 0, 0, 0),
        })

    # Feb 7
    for hour, minute, app, mins, productive in [
        (8, 30, "Notion", 60, True),
        (9, 45, "Canvas", 72, True),
        (13, 15, "Microsoft 365", 60, True),
        (15, 0, "Reddit", 28, False),
        (18, 10, "YouTube", 38, False),
    ]:
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": app,
            "category": "productivity" if productive else "entertainment",
            "duration_minutes": mins,
            "is_productive": productive,
            "timestamp": datetime(2026, 2, 7, hour, minute, 0),
            "date": datetime(2026, 2, 7, 0, 0, 0),
        })

    # Feb 8 (today)
    for hour, minute, app, mins, productive in [
        (9, 10, "Notion", 35, True),
        (10, 0, "Google Calendar", 25, True),
        (13, 30, "Instagram", 12, False),
        (15, 5, "Canvas", 36, True),
        (17, 40, "YouTube", 18, False),
    ]:
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": app,
            "category": "productivity" if productive else "entertainment",
            "duration_minutes": mins,
            "is_productive": productive,
            "timestamp": datetime(2026, 2, 8, hour, minute, 0),
            "date": datetime(2026, 2, 8, 0, 0, 0),
        })

    await db.screen_time.delete_many({"user_id": user_id})
    await db.screen_time.insert_many(screen_time_logs)

    # 5. Create trail progress
    trail_progress = {
        "user_id": user_id,
        "current_tile": 10,
        "current_trail_index": 0,
        "total_steps_earned": 14,
        "steps_invested": 10,
        "steps_banked": 4,
        "history": [
            {
                "date": datetime(2026, 2, 6, 0, 0, 0),
                "steps_earned": 4,
                "steps_invested": 0,
                "productive_minutes": 83,
                "unproductive_minutes": 36,
            },
            {
                "date": datetime(2026, 2, 7, 0, 0, 0),
                "steps_earned": 6,
                "steps_invested": 4,
                "productive_minutes": 192,
                "unproductive_minutes": 66,
            },
            {
                "date": datetime(2026, 2, 8, 0, 0, 0),
                "steps_earned": 4,
                "steps_invested": 6,
                "productive_minutes": 96,
                "unproductive_minutes": 30,
            },
        ],
        "created_at": datetime(2026, 2, 5, 12, 0, 0),
        "updated_at": datetime(2026, 2, 8, 18, 0, 0),
    }

    await db.trail_progress.delete_one({"user_id": user_id})
    await db.trail_progress.insert_one(trail_progress)

    # 6. Create assignments
    assignments = [
        {
            "user_id": user_id,
            "canvas_id": 123456,
            "course_name": "CS 2334 - Data Structures",
            "course_id": 789,
            "title": "Project 2: Binary Search Tree",
            "description": "Implement BST with insert, delete, and search operations. Include test coverage.",
            "due_at": datetime(2026, 2, 12, 23, 59, 0),
            "points_possible": 100.0,
            "status": "upcoming",
            "synced_from_canvas": False,
            "time_spent_minutes": 0,
            "created_at": datetime(2026, 2, 5, 12, 0, 0),
            "updated_at": datetime(2026, 2, 8, 18, 0, 0),
        },
        {
            "user_id": user_id,
            "canvas_id": 123457,
            "course_name": "ENGL 1113 - Composition",
            "course_id": 790,
            "title": "Essay 2: Rhetorical Analysis",
            "description": "Analyze rhetorical strategies. 5-7 pages, MLA format.",
            "due_at": datetime(2026, 2, 15, 23, 59, 0),
            "points_possible": 150.0,
            "status": "upcoming",
            "synced_from_canvas": False,
            "time_spent_minutes": 0,
            "created_at": datetime(2026, 2, 6, 10, 0, 0),
            "updated_at": datetime(2026, 2, 8, 18, 0, 0),
        },
    ]

    await db.assignments.delete_many({"user_id": user_id})
    await db.assignments.insert_many(assignments)

    return {
        "success": True,
        "message": "Mock user created successfully",
        "user": {
            "id": user_id,
            "email": "avery.park@demo.com",
            "password": "demo123",
            "name": "Avery Park",
        },
        "stats": {
            "goals": len(goals_data),
            "goal_logs": len(goal_logs),
            "screen_time_logs": len(screen_time_logs),
            "assignments": len(assignments),
            "total_steps_earned": 14,
            "steps_invested": 10,
            "steps_banked": 4,
        },
    }
