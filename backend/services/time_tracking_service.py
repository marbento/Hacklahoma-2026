"""
Time tracking and productivity analysis service
Uses Gemini AI to classify apps and calculate wasted/saved time
"""
import google.generativeai as genai
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from config.settings import get_settings

settings = get_settings()


# ── App classification ─────────────────────────────────────────
PRODUCTIVE_APPS = [
    "Notion", "Google Calendar", "Canvas", "Microsoft 365", "Outlook",
    "Word", "Excel", "PowerPoint", "OneNote", "Google Docs", "Google Sheets",
    "Slack", "Zoom", "Teams", "Xcode", "VS Code", "GitHub", "Terminal",
    "Calculator", "Mail", "Notes", "Reminders", "Files", "Safari"
]

WASTEFUL_APPS = [
    "Instagram", "TikTok", "YouTube", "Snapchat", "Reddit", "Twitter",
    "Facebook", "Discord", "WhatsApp", "Games", "Amazon", "Netflix",
    "Hulu", "Disney+", "Twitch", "Pinterest"
]


def _get_gemini_model():
    """Get configured Gemini model for classification."""
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY not configured")
    genai.configure(api_key=settings.gemini_api_key)

    # Try primary model first, fallback to preview if it fails
    try:
        return genai.GenerativeModel("gemini-2.5-flash")
    except Exception:
        return genai.GenerativeModel("gemini-3-flash-preview")


async def classify_app_usage(app_name: str, duration_minutes: int, context: Optional[str] = None) -> Dict:
    """
    Use Gemini to classify if app usage was productive or wasteful.

    Args:
        app_name: Name of the app
        duration_minutes: How long it was used
        context: Optional context about what was being done

    Returns:
        {
            "is_productive": bool,
            "waste_score": float (0.0-1.0),
            "category": str,
            "reasoning": str
        }
    """
    # Quick classification for known apps
    if app_name in PRODUCTIVE_APPS:
        return {
            "is_productive": True,
            "waste_score": 0.0,
            "category": "productivity",
            "reasoning": "Known productive app"
        }

    if app_name in WASTEFUL_APPS:
        return {
            "is_productive": False,
            "waste_score": 1.0,
            "category": "entertainment",
            "reasoning": "Known wasteful/entertainment app"
        }

    # Use Gemini for unknown apps
    try:
        model = _get_gemini_model()
        prompt = f"""
        Classify this app usage as productive or wasteful:

        App: {app_name}
        Duration: {duration_minutes} minutes
        Context: {context or "No additional context"}

        Return JSON with:
        {{
            "is_productive": true/false,
            "waste_score": 0.0-1.0 (how wasteful, 0=fully productive, 1=fully wasteful),
            "category": "productivity/communication/entertainment/social/shopping/other",
            "reasoning": "brief explanation"
        }}
        """

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
        except Exception as api_error:
            # Try fallback model if primary fails
            error_str = str(api_error).lower()
            if "404" in error_str or "not found" in error_str:
                print(f"⚠️ Primary model failed, trying fallback...")
                genai.configure(api_key=settings.gemini_api_key)
                fallback_model = genai.GenerativeModel("gemini-3-flash-preview")
                response = fallback_model.generate_content(prompt)
                text = response.text.strip()
            else:
                raise

        # Parse JSON from response
        import json
        result = json.loads(text.replace("```json", "").replace("```", ""))
        return result

    except Exception as e:
        # Default to neutral if classification fails
        return {
            "is_productive": False,
            "waste_score": 0.5,
            "category": "other",
            "reasoning": f"Classification failed: {str(e)}"
        }


async def predict_wasted_time(behavior_log: List[Dict]) -> Dict:
    """
    Calculate wasted time from a day's behavior log.

    Args:
        behavior_log: List of {app_name, duration_minutes, timestamp, is_productive (optional)}

    Returns:
        {
            "total_wasted_minutes": float,
            "total_productive_minutes": float,
            "net_minutes": float,
            "breakdown": [{app, minutes, waste_score, category}]
        }
    """
    total_wasted = 0.0
    total_productive = 0.0
    breakdown = []

    for entry in behavior_log:
        app_name = entry.get("app_name", "Unknown")
        duration = entry.get("duration_minutes", 0)

        # Use provided classification or classify
        if "is_productive" in entry:
            is_productive = entry["is_productive"]
            waste_score = 0.0 if is_productive else 1.0
            category = entry.get("category", "other")
        else:
            classification = await classify_app_usage(
                app_name,
                duration,
                entry.get("context")
            )
            is_productive = classification["is_productive"]
            waste_score = classification["waste_score"]
            category = classification["category"]

        # Calculate wasted vs productive time
        wasted = duration * waste_score
        productive = duration * (1.0 - waste_score)

        total_wasted += wasted
        total_productive += productive

        breakdown.append({
            "app": app_name,
            "duration_minutes": duration,
            "wasted_minutes": wasted,
            "productive_minutes": productive,
            "waste_score": waste_score,
            "category": category,
            "is_productive": is_productive
        })

    return {
        "total_wasted_minutes": total_wasted,
        "total_productive_minutes": total_productive,
        "net_minutes": total_productive - total_wasted,
        "breakdown": breakdown
    }


async def predict_saved_time(behavior_log: List[Dict], baseline_log: Optional[List[Dict]] = None) -> Dict:
    """
    Calculate time saved compared to baseline behavior.

    Args:
        behavior_log: Today's behavior
        baseline_log: Yesterday's or average behavior (optional)

    Returns:
        {
            "saved_minutes": float,
            "wasted_today": float,
            "wasted_baseline": float,
            "improvement_pct": float
        }
    """
    today_analysis = await predict_wasted_time(behavior_log)
    wasted_today = today_analysis["total_wasted_minutes"]

    if not baseline_log:
        # No baseline, just return today's waste as "saved" (compared to doing nothing)
        return {
            "saved_minutes": -wasted_today,  # Negative = time wasted
            "wasted_today": wasted_today,
            "wasted_baseline": 0,
            "improvement_pct": 0
        }

    baseline_analysis = await predict_wasted_time(baseline_log)
    wasted_baseline = baseline_analysis["total_wasted_minutes"]

    saved = wasted_baseline - wasted_today
    improvement_pct = (saved / wasted_baseline * 100) if wasted_baseline > 0 else 0

    return {
        "saved_minutes": saved,
        "wasted_today": wasted_today,
        "wasted_baseline": wasted_baseline,
        "improvement_pct": improvement_pct
    }


async def analyze_daily_usage(user_id: str, date: datetime, db) -> Dict:
    """
    Analyze a full day's screen time usage for a user.

    Args:
        user_id: User ID
        date: Date to analyze (datetime)
        db: Database connection

    Returns:
        {
            "date": str,
            "total_minutes": float,
            "productive_minutes": float,
            "unproductive_minutes": float,
            "net_minutes": float,
            "steps_from_time": int,
            "app_breakdown": [...]
        }
    """
    # Get all screen time logs for the day
    day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)

    logs = await db.screen_time.find({
        "user_id": user_id,
        "timestamp": {"$gte": day_start, "$lt": day_end}
    }).to_list(1000)

    if not logs:
        return {
            "date": day_start.strftime("%Y-%m-%d"),
            "total_minutes": 0,
            "productive_minutes": 0,
            "unproductive_minutes": 0,
            "net_minutes": 0,
            "steps_from_time": 0,
            "app_breakdown": []
        }

    # Build behavior log from screen time entries
    behavior_log = [
        {
            "app_name": log.get("app_name"),
            "duration_minutes": log.get("duration_minutes", 0),
            "is_productive": log.get("is_productive", False),
            "category": log.get("category", "other"),
            "timestamp": log.get("timestamp")
        }
        for log in logs
    ]

    # Analyze
    analysis = await predict_wasted_time(behavior_log)

    # Calculate steps from productive time (1 step per hour)
    productive_hours = analysis["total_productive_minutes"] / 60
    steps_from_time = int(productive_hours)

    return {
        "date": day_start.strftime("%Y-%m-%d"),
        "total_minutes": analysis["total_productive_minutes"] + analysis["total_wasted_minutes"],
        "productive_minutes": analysis["total_productive_minutes"],
        "unproductive_minutes": analysis["total_wasted_minutes"],
        "net_minutes": analysis["net_minutes"],
        "steps_from_time": steps_from_time,
        "app_breakdown": analysis["breakdown"]
    }


async def calculate_daily_steps(user_id: str, date: datetime, db) -> Dict:
    """
    Calculate steps earned for a specific day.

    Formula:
    - 1 step per hour of net productive time
    - 3 steps per completed goal/task

    Args:
        user_id: User ID
        date: Date to calculate for
        db: Database connection

    Returns:
        {
            "date": str,
            "steps_from_time": int,
            "steps_from_goals": int,
            "total_steps": int,
            "productive_minutes": float,
            "completed_goals": int
        }
    """
    # Analyze screen time for the day
    usage = await analyze_daily_usage(user_id, date, db)
    steps_from_time = usage["steps_from_time"]

    # Count completed goals for the day
    day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)

    # Get all active goals
    goals = await db.goals.find({
        "user_id": user_id,
        "is_active": True
    }).to_list(100)

    completed_goals = 0
    for goal in goals:
        # Get logs for this goal on this day
        logs = await db.goal_logs.find({
            "goal_id": str(goal["_id"]),
            "date": {"$gte": day_start, "$lt": day_end}
        }).to_list(100)

        # Sum progress
        progress = sum(log.get("value", 0) for log in logs)
        target = goal.get("target_value", 1)

        # If goal was met, count it
        if progress >= target:
            completed_goals += 1

    # Calculate steps from goals (3 steps per completed goal)
    steps_from_goals = completed_goals * 3
    total_steps = steps_from_time + steps_from_goals

    return {
        "date": day_start.strftime("%Y-%m-%d"),
        "steps_from_time": steps_from_time,
        "steps_from_goals": steps_from_goals,
        "total_steps": total_steps,
        "productive_minutes": usage["productive_minutes"],
        "completed_goals": completed_goals
    }


async def get_banked_steps(user_id: str, db) -> Dict:
    """
    Get today's banked steps (not yet invested in trail).

    Returns:
        {
            "date": str,
            "banked_steps": int,
            "steps_from_time": int,
            "steps_from_goals": int,
            "productive_minutes": float,
            "completed_goals": int
        }
    """
    today = datetime.utcnow()
    return await calculate_daily_steps(user_id, today, db)
