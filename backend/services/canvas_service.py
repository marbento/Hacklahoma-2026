import httpx
from datetime import datetime
from typing import List, Optional, Dict, Any
from config.database import get_db
import re

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


def _strip_html(html_text: str) -> str:
    """Strip HTML tags and extract plain text."""
    if not html_text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', html_text)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


async def get_canvas_submission(canvas_token: str, course_id: int, assignment_id: int) -> Optional[dict]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{CANVAS_API}/courses/{course_id}/assignments/{assignment_id}/submissions/self",
                headers={"Authorization": f"Bearer {canvas_token}"},
                params={"include[]": ["submission_history", "submission_comments", "rubric_assessment"]},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None


async def get_assignment_details(canvas_token: str, course_id: int, assignment_id: int) -> Optional[Dict[str, Any]]:
    """Get detailed assignment info including files, quiz questions, etc."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{CANVAS_API}/courses/{course_id}/assignments/{assignment_id}",
                headers={"Authorization": f"Bearer {canvas_token}"},
                params={"include[]": ["submission", "rubric_criteria"]},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return None


async def get_quiz_questions(canvas_token: str, course_id: int, quiz_id: int) -> List[dict]:
    """Fetch quiz questions if assignment is a quiz."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{CANVAS_API}/courses/{course_id}/quizzes/{quiz_id}/questions",
                headers={"Authorization": f"Bearer {canvas_token}"},
                params={"per_page": 100},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return []


async def extract_assignment_content(canvas_token: str, course_id: int, assignment: dict) -> Dict[str, Any]:
    """Extract rich content from assignment including files, quiz questions, rubrics, etc."""
    content = {
        "description_text": _strip_html(assignment.get("description", "")),
        "files": [],
        "quiz_questions": [],
        "rubric_criteria": [],
        "submission_types": assignment.get("submission_types", []),
    }

    # Get detailed assignment info
    details = await get_assignment_details(canvas_token, course_id, assignment["id"])
    if details:
        # Extract rubric criteria
        if details.get("rubric"):
            for criterion in details.get("rubric", []):
                content["rubric_criteria"].append({
                    "description": criterion.get("description", ""),
                    "points": criterion.get("points", 0),
                    "ratings": [r.get("description", "") for r in criterion.get("ratings", [])]
                })

        # If it's a quiz, get questions
        if assignment.get("is_quiz_assignment") and assignment.get("quiz_id"):
            questions = await get_quiz_questions(canvas_token, course_id, assignment["quiz_id"])
            for q in questions:
                content["quiz_questions"].append({
                    "question_name": q.get("question_name", ""),
                    "question_text": _strip_html(q.get("question_text", "")),
                    "question_type": q.get("question_type", ""),
                    "points_possible": q.get("points_possible", 0),
                })

    return content


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

            # Get submission status
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

            # Extract rich content for better study plans
            rich_content = await extract_assignment_content(canvas_token, course_id, a)

            # Build enhanced description with all available context
            enhanced_description = a.get("description", "")
            if rich_content["description_text"]:
                enhanced_description = rich_content["description_text"]

            # Add rubric criteria to description
            if rich_content["rubric_criteria"]:
                rubric_text = "\n\nRubric Criteria:\n"
                for criterion in rich_content["rubric_criteria"]:
                    rubric_text += f"- {criterion['description']} ({criterion['points']} points)\n"
                enhanced_description += rubric_text

            # Add quiz questions to description
            if rich_content["quiz_questions"]:
                quiz_text = "\n\nQuiz Topics:\n"
                for q in rich_content["quiz_questions"][:10]:  # Limit to first 10
                    quiz_text += f"- {q['question_name']}: {q['question_text'][:200]}\n"
                enhanced_description += quiz_text

            await db.assignments.update_one(
                {"user_id": user_id, "canvas_id": a["id"]},
                {
                    "$set": {
                        "user_id": user_id,
                        "canvas_id": a["id"],
                        "course_name": course_name,
                        "course_id": course_id,
                        "title": a.get("name", "Untitled"),
                        "description": enhanced_description,
                        "due_at": due_at,
                        "points_possible": a.get("points_possible"),
                        "status": status,
                        "grade": grade,
                        "synced_from_canvas": True,
                        "rich_content": rich_content,  # Store structured content separately
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
