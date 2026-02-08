from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from config.database import get_db
from services.auth_service import get_current_user
from services.gemini_service import generate_encouragement, generate_nudge_message
from services.elevenlabs_service import text_to_speech_base64
from schemas.progress import NudgeData

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["_id"]
    today = datetime.utcnow().strftime("%Y-%m-%d")

    goals = await db.goals.find({"user_id": user_id, "is_active": True}).to_list(50)
    goals_data = []
    goals_completed = 0
    for g in goals:
        logs = await db.goal_logs.find({"goal_id": str(g["_id"]), "date": {"$gte": datetime.strptime(today, "%Y-%m-%d")}}).to_list(50)
        progress = sum(l.get("value", 0) for l in logs)
        met = progress >= g.get("target_value", 1)
        if met:
            goals_completed += 1
        goals_data.append({"id": str(g["_id"]), "title": g["title"], "target": g.get("target_value", 1), "unit": g.get("target_unit", "times"), "progress": progress, "met": met, "streak": g.get("current_streak", 0)})

    week_from_now = datetime.utcnow() + timedelta(days=7)
    assignments = await db.assignments.find({
        "user_id": user_id, "due_at": {"$lte": week_from_now, "$gte": datetime.utcnow()},
        "status": {"$in": ["upcoming", "in_progress"]},
    }).sort("due_at", 1).to_list(20)

    assignments_data = [
        {"id": str(a["_id"]), "title": a["title"], "course": a.get("course_name", ""),
         "due_at": a["due_at"].isoformat() if a.get("due_at") else None,
         "days_left": max(0, (a["due_at"] - datetime.utcnow()).days) if a.get("due_at") else None,
         "has_study_plan": a.get("study_plan") is not None, "time_spent": a.get("time_spent_minutes", 0)}
        for a in assignments
    ]

    return {"user_name": user.get("name", ""), "date": today, "goals": goals_data, "goals_completed": goals_completed, "goals_total": len(goals_data), "upcoming_assignments": assignments_data, "assignments_count": len(assignments_data)}


@router.get("/nudge")
async def get_nudge_data(user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["_id"]

    goals = await db.goals.find({"user_id": user_id, "is_active": True}).to_list(5)
    current_goal = goals[0]["title"] if goals else None

    nearest = await db.assignments.find_one(
        {"user_id": user_id, "due_at": {"$gte": datetime.utcnow()}, "status": {"$in": ["upcoming", "in_progress"]}},
        sort=[("due_at", 1)],
    )

    upcoming_assignment = None
    assignment_due = None
    redirect_links = []
    if nearest:
        upcoming_assignment = f"{nearest.get('course_name', '')}: {nearest['title']}"
        if nearest.get("due_at"):
            days = (nearest["due_at"] - datetime.utcnow()).days
            assignment_due = f"Due in {days} day{'s' if days != 1 else ''}"
        if nearest.get("canvas_id") and nearest.get("course_id"):
            redirect_links.append({"label": nearest["title"], "url": f"https://canvas.ou.edu/courses/{nearest['course_id']}/assignments/{nearest['canvas_id']}", "type": "canvas"})

    nudge = await generate_nudge_message(current_goal=current_goal, upcoming_assignment=upcoming_assignment)

    return NudgeData(title=nudge.get("title", "Before you scroll..."), subtitle=nudge.get("subtitle", "Your call — no judgment."),
                     current_goal=current_goal, upcoming_assignment=upcoming_assignment, assignment_due=assignment_due,
                     redirect_links=redirect_links, encouragement=nudge.get("subtitle", ""))


@router.get("/encouragement")
async def get_encouragement(user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["_id"]
    goals = await db.goals.find({"user_id": user_id, "is_active": True}).to_list(50)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    goals_completed = 0
    streaks = {}
    for g in goals:
        logs = await db.goal_logs.find({"goal_id": str(g["_id"]), "date": {"$gte": datetime.strptime(today, "%Y-%m-%d")}}).to_list(50)
        if sum(l.get("value", 0) for l in logs) >= g.get("target_value", 1):
            goals_completed += 1
        if g.get("current_streak", 0) > 0:
            streaks[g["title"]] = g["current_streak"]

    graded = await db.assignments.find({"user_id": user_id, "grade": {"$ne": None}}).sort("updated_at", -1).to_list(5)
    grades = [a["grade"] for a in graded if a.get("grade")]

    message = await generate_encouragement(user_name=user.get("name", "friend"), goals_completed=goals_completed, goals_total=len(goals), assignments_done=0, current_streaks=streaks, recent_grades=grades)
    return {"encouragement": message}


@router.get("/encouragement/audio")
async def get_encouragement_audio(user: dict = Depends(get_current_user)):
    data = await get_encouragement(user)
    audio_b64 = await text_to_speech_base64(data["encouragement"])
    return {"audio_base64": audio_b64, "text": data["encouragement"]}


@router.get("/daily-briefing/audio")
async def get_daily_briefing_audio(user: dict = Depends(get_current_user)):
    dashboard = await get_dashboard(user)
    goals_text = f"You have {dashboard['goals_total']} active goals. {dashboard['goals_completed']} completed so far today."
    assignments_text = f"You have {dashboard['assignments_count']} assignments coming up this week."
    if dashboard["upcoming_assignments"]:
        nearest = dashboard["upcoming_assignments"][0]
        assignments_text += f" The most urgent is {nearest['title']} for {nearest['course']}, due in {nearest['days_left']} days."
    encouragement = (await get_encouragement(user))["encouragement"]
    script = f"Good morning {dashboard['user_name']}. Here's your Trail briefing. {goals_text} {assignments_text} {encouragement} Have a great day."
    audio_b64 = await text_to_speech_base64(script)
    return {"audio_base64": audio_b64, "script": script}
