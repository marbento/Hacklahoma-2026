"""
Seed script to create mock user data for demo
Run with: python seed_mock_user.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from config.settings import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


async def seed_mock_user():
    """Create Avery Park mock user with 3 days of history"""
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]

    print("🌱 Seeding mock user data...")

    # 1. Create user account
    user_data = {
        "email": "avery.park@demo.com",
        "password_hash": pwd_context.hash("demo123"),  # Password: demo123
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

    # Delete existing mock user if exists
    await db.users.delete_one({"email": "avery.park@demo.com"})
    result = await db.users.insert_one(user_data)
    user_id = str(result.inserted_id)
    print(f"✅ Created user: {user_data['name']} (ID: {user_id})")

    # 2. Create goals (fitness, academic, wellness)
    goals_data = [
        {
            "user_id": user_id,
            "title": "Study 3 hours daily",
            "description": "Focus on coursework and assignments",
            "category": "academic",
            "frequency": "daily",
            "target_value": 180.0,  # 3 hours in minutes
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
            "description": "Exercise for 30 minutes",
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
            "description": "Get quality rest",
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
    await db.goals.insert_many(goals_data)
    print(f"✅ Created {len(goals_data)} goals")

    # 3. Create goal logs for history (Feb 6-8)
    goal_logs = []

    # Feb 6 - completed 1 task (study goal)
    goal_logs.append({
        "user_id": user_id,
        "goal_id": str(goals_data[0]["_id"]) if "_id" in goals_data[0] else "mock-goal-1",
        "value": 180.0,
        "date": datetime(2026, 2, 6, 16, 0, 0),
        "source": "manual",
        "notes": "Completed coursework",
    })

    # Feb 7 - completed 1 task (study goal)
    goal_logs.append({
        "user_id": user_id,
        "goal_id": str(goals_data[0]["_id"]) if "_id" in goals_data[0] else "mock-goal-1",
        "value": 192.0,
        "date": datetime(2026, 2, 7, 18, 0, 0),
        "source": "manual",
        "notes": "Study session + Canvas work",
    })

    # Feb 8 - completed 1 task (study goal)
    goal_logs.append({
        "user_id": user_id,
        "goal_id": str(goals_data[0]["_id"]) if "_id" in goals_data[0] else "mock-goal-1",
        "value": 96.0,
        "date": datetime(2026, 2, 8, 17, 0, 0),
        "source": "manual",
        "notes": "Notion planning + Canvas review",
    })

    await db.goal_logs.delete_many({"user_id": user_id})
    await db.goal_logs.insert_many(goal_logs)
    print(f"✅ Created {len(goal_logs)} goal completion logs")

    # 4. Create screen time logs
    screen_time_logs = []

    # Feb 6 behavior log
    feb6_logs = [
        {"time": "09:05", "app": "Notion", "minutes": 42, "productive": True},
        {"time": "10:20", "app": "Google Calendar", "minutes": 41, "productive": True},
        {"time": "14:10", "app": "Instagram", "minutes": 18, "productive": False},
        {"time": "16:40", "app": "YouTube", "minutes": 18, "productive": False},
    ]

    for log in feb6_logs:
        hour, minute = map(int, log["time"].split(":"))
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": log["app"],
            "category": "productivity" if log["productive"] else "entertainment",
            "duration_minutes": log["minutes"],
            "is_productive": log["productive"],
            "timestamp": datetime(2026, 2, 6, hour, minute, 0),
            "date": datetime(2026, 2, 6, 0, 0, 0),
        })

    # Feb 7 behavior log
    feb7_logs = [
        {"time": "08:30", "app": "Notion", "minutes": 60, "productive": True},
        {"time": "09:45", "app": "Canvas", "minutes": 72, "productive": True},
        {"time": "13:15", "app": "Microsoft 365", "minutes": 60, "productive": True},
        {"time": "15:00", "app": "Reddit", "minutes": 28, "productive": False},
        {"time": "18:10", "app": "YouTube", "minutes": 38, "productive": False},
    ]

    for log in feb7_logs:
        hour, minute = map(int, log["time"].split(":"))
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": log["app"],
            "category": "productivity" if log["productive"] else "entertainment",
            "duration_minutes": log["minutes"],
            "is_productive": log["productive"],
            "timestamp": datetime(2026, 2, 7, hour, minute, 0),
            "date": datetime(2026, 2, 7, 0, 0, 0),
        })

    # Feb 8 behavior log (today)
    feb8_logs = [
        {"time": "09:10", "app": "Notion", "minutes": 35, "productive": True},
        {"time": "10:00", "app": "Google Calendar", "minutes": 25, "productive": True},
        {"time": "13:30", "app": "Instagram", "minutes": 12, "productive": False},
        {"time": "15:05", "app": "Canvas", "minutes": 36, "productive": True},
        {"time": "17:40", "app": "YouTube", "minutes": 18, "productive": False},
    ]

    for log in feb8_logs:
        hour, minute = map(int, log["time"].split(":"))
        screen_time_logs.append({
            "user_id": user_id,
            "app_name": log["app"],
            "category": "productivity" if log["productive"] else "entertainment",
            "duration_minutes": log["minutes"],
            "is_productive": log["productive"],
            "timestamp": datetime(2026, 2, 8, hour, minute, 0),
            "date": datetime(2026, 2, 8, 0, 0, 0),
        })

    await db.screen_time.delete_many({"user_id": user_id})
    await db.screen_time.insert_many(screen_time_logs)
    print(f"✅ Created {len(screen_time_logs)} screen time logs")

    # 5. Create trail progress data
    trail_progress = {
        "user_id": user_id,
        "current_tile": 10,  # They've invested 10 steps over 3 days
        "current_trail_index": 0,  # On first trail
        "total_steps_earned": 14,  # 4 + 6 + 4 from history
        "steps_invested": 10,  # Invested previous days' steps
        "steps_banked": 4,  # Today's steps not yet invested
        "history": [
            {
                "date": datetime(2026, 2, 6, 0, 0, 0),
                "steps_earned": 4,  # 1 from hours + 3 from task
                "steps_invested": 0,
                "productive_minutes": 83,  # 42 + 41
                "unproductive_minutes": 36,  # 18 + 18
            },
            {
                "date": datetime(2026, 2, 7, 0, 0, 0),
                "steps_earned": 6,  # 3 from hours + 3 from task
                "steps_invested": 4,  # Invested previous day
                "productive_minutes": 192,  # 60 + 72 + 60
                "unproductive_minutes": 66,  # 28 + 38
            },
            {
                "date": datetime(2026, 2, 8, 0, 0, 0),
                "steps_earned": 4,  # 1 from hours + 3 from task
                "steps_invested": 6,  # Invested previous day
                "productive_minutes": 96,  # 35 + 25 + 36
                "unproductive_minutes": 30,  # 12 + 18
            },
        ],
        "created_at": datetime(2026, 2, 5, 12, 0, 0),
        "updated_at": datetime(2026, 2, 8, 18, 0, 0),
    }

    await db.trail_progress.delete_one({"user_id": user_id})
    await db.trail_progress.insert_one(trail_progress)
    print("✅ Created trail progress data")

    # 6. Create some mock assignments
    assignments = [
        {
            "user_id": user_id,
            "canvas_id": 123456,
            "course_name": "CS 2334 - Data Structures",
            "course_id": 789,
            "title": "Project 2: Binary Search Tree",
            "description": "Implement a Binary Search Tree with insert, delete, and search operations. Include comprehensive test coverage.",
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
            "description": "Analyze the rhetorical strategies used in a published essay. 5-7 pages, MLA format.",
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
    print(f"✅ Created {len(assignments)} assignments")

    print("\n" + "="*60)
    print("🎉 Mock user seed complete!")
    print("="*60)
    print("\n📧 Login credentials:")
    print(f"   Email: avery.park@demo.com")
    print(f"   Password: demo123")
    print("\n📊 Stats:")
    print(f"   Total steps earned: 14")
    print(f"   Steps invested: 10 (current trail position)")
    print(f"   Steps banked: 4 (ready to invest)")
    print(f"   Current streak: 3 days")
    print(f"   Goals: {len(goals_data)}")
    print(f"   Assignments: {len(assignments)}")
    print(f"   Screen time logs: {len(screen_time_logs)}")
    print("\n" + "="*60)

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_mock_user())
