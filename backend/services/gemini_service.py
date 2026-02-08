import google.generativeai as genai
import json
from typing import Optional, List, Dict
from config.settings import get_settings
from schemas.assignment import SubTask, StudyPlan
from datetime import datetime

settings = get_settings()


def _get_model():
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel("gemini-pro")


async def generate_study_plan(
    assignment_title: str, course_name: str, description: str = "",
    points_possible: float = None, due_at: datetime = None,
) -> StudyPlan:
    model = _get_model()
    days_left = ""
    if due_at:
        delta = due_at - datetime.utcnow()
        days_left = f"Due in {delta.days} days."

    prompt = f"""You are a helpful study coach for a college student. Analyze this assignment and create a study plan.

Assignment: {assignment_title}
Course: {course_name}
Description: {description[:2000] if description else 'No description provided'}
Points: {points_possible or 'Unknown'}
{days_left}

Respond in this exact JSON format (no markdown, no backticks):
{{
    "estimated_total_minutes": <int>,
    "key_concepts": ["concept1", "concept2"],
    "subtasks": [
        {{
            "title": "Step 1 title",
            "description": "What to do and key concepts needed",
            "estimated_minutes": <int>,
            "resources": ["https://youtube.com/results?search_query=relevant+topic", "https://www.khanacademy.org/search?referer=%2F&page_search_query=relevant+topic"]
        }}
    ],
    "encouragement": "A warm, motivating message about tackling this assignment"
}}

Be specific with resources. Keep subtasks actionable and bite-sized (15-30 min each)."""

    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    try:
        data = json.loads(text.strip())
    except json.JSONDecodeError:
        data = {
            "estimated_total_minutes": 60,
            "key_concepts": ["Review course materials"],
            "subtasks": [
                {"title": "Review requirements", "description": "Read the full assignment", "estimated_minutes": 10, "resources": []},
                {"title": "Work through problems", "description": "Complete step by step", "estimated_minutes": 40, "resources": []},
                {"title": "Review and submit", "description": "Check your work", "estimated_minutes": 10, "resources": []},
            ],
            "encouragement": f"You've got this! Take {assignment_title} one step at a time.",
        }

    return StudyPlan(
        assignment_id="",
        estimated_total_minutes=data.get("estimated_total_minutes", 60),
        key_concepts=data.get("key_concepts", []),
        subtasks=[SubTask(**st) for st in data.get("subtasks", [])],
        encouragement=data.get("encouragement", "You've got this!"),
    )


async def generate_encouragement(
    user_name: str, goals_completed: int, goals_total: int,
    assignments_done: int, current_streaks: Dict[str, int], recent_grades: List[float],
) -> str:
    model = _get_model()
    streak_text = ", ".join([f"{name}: {count} days" for name, count in current_streaks.items()])
    grade_text = f"Recent grades: {', '.join([str(g) for g in recent_grades])}" if recent_grades else "No grades yet"

    prompt = f"""You are Trail, a warm and encouraging AI life coach for a college student named {user_name}.

Their progress today:
- Goals completed: {goals_completed}/{goals_total}
- Assignments worked on: {assignments_done}
- Active streaks: {streak_text or 'Starting fresh'}
- {grade_text}

Write a brief (2-3 sentences), genuine encouragement message. Reference their specific progress.
Be warm but not cheesy. Sound like a supportive friend, not a corporate chatbot."""

    response = model.generate_content(prompt)
    return response.text.strip()


async def generate_nudge_message(
    current_goal: Optional[str] = None, upcoming_assignment: Optional[str] = None,
    time_wasted_today: int = 0,
) -> Dict[str, str]:
    model = _get_model()
    context_parts = []
    if current_goal:
        context_parts.append(f"Their current goal: {current_goal}")
    if upcoming_assignment:
        context_parts.append(f"Upcoming assignment: {upcoming_assignment}")
    if time_wasted_today > 0:
        context_parts.append(f"Already spent {time_wasted_today} min on blocked apps today")
    context = "\n".join(context_parts) if context_parts else "No specific context"

    prompt = f"""You are Trail, a gentle nudge app. The user just tried to open a distracting app.

Context:
{context}

Write a JSON response with:
{{"title": "A short friendly title (under 8 words)", "subtitle": "A gentle 1-2 sentence nudge. End with 'Your call — no judgment.'"}}

Be warm, not preachy."""

    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {"title": "Before you scroll...", "subtitle": f"Remember: {current_goal or 'you had plans'}. Your call — no judgment."}
