import httpx
from datetime import datetime
from typing import List, Optional, Dict, Any
from config.database import get_db
import re
import base64

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
    async with httpx.AsyncClient(timeout=30.0) as client:
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


async def download_file_content(file_url: str, canvas_token: str, max_size_mb: int = 5) -> Optional[str]:
    """Download file from Canvas and extract text content. Limited to text-based files."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Get file info first
            resp = await client.get(file_url, headers={"Authorization": f"Bearer {canvas_token}"}, follow_redirects=True)

            # Check file size (limit to max_size_mb MB)
            content_length = resp.headers.get("content-length")
            if content_length and int(content_length) > max_size_mb * 1024 * 1024:
                return f"[File too large: {int(content_length) / 1024 / 1024:.1f}MB]"

            # Only process text-based files
            content_type = resp.headers.get("content-type", "").lower()
            content = resp.content

            # Try to extract text based on content type
            if "text" in content_type or "json" in content_type or "xml" in content_type:
                return content.decode("utf-8", errors="ignore")[:10000]  # Limit to 10k chars

            elif "pdf" in content_type:
                # For PDFs, return a note - actual parsing would require PyPDF2
                return "[PDF file attached - contains assignment materials]"

            elif "word" in content_type or "msword" in content_type or "document" in content_type:
                # For DOCX, return a note - actual parsing would require python-docx
                return "[Word document attached - contains assignment materials]"

            else:
                return f"[File attached: {content_type}]"

        except Exception as e:
            return f"[Error reading file: {str(e)}]"


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
        "file_contents": [],
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

        # Extract files attached to the assignment
        if details.get("attachments"):
            for file_info in details.get("attachments", []):
                file_name = file_info.get("filename", "unknown")
                file_url = file_info.get("url")

                content["files"].append({
                    "name": file_name,
                    "url": file_url,
                    "size": file_info.get("size", 0),
                })

                # Try to download and extract content from the file
                if file_url:
                    file_content = await download_file_content(file_url, canvas_token)
                    if file_content:
                        content["file_contents"].append({
                            "filename": file_name,
                            "content": file_content[:5000],  # Limit to 5k chars per file
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

            # Add file contents to description
            if rich_content["file_contents"]:
                files_text = "\n\n=== Assignment Files ===\n"
                for file_data in rich_content["file_contents"]:
                    files_text += f"\n--- {file_data['filename']} ---\n"
                    files_text += f"{file_data['content']}\n"
                enhanced_description += files_text

            # Add rubric criteria to description
            if rich_content["rubric_criteria"]:
                rubric_text = "\n\n=== Rubric Criteria ===\n"
                for criterion in rich_content["rubric_criteria"]:
                    rubric_text += f"- {criterion['description']} ({criterion['points']} points)\n"
                    if criterion['ratings']:
                        rubric_text += f"  Levels: {', '.join(criterion['ratings'])}\n"
                enhanced_description += rubric_text

            # Add quiz questions to description
            if rich_content["quiz_questions"]:
                quiz_text = "\n\n=== Quiz Questions ===\n"
                for q in rich_content["quiz_questions"][:15]:  # Limit to first 15
                    quiz_text += f"\nQ: {q['question_name']} ({q['points_possible']} pts)\n"
                    quiz_text += f"   {q['question_text'][:300]}\n"
                    quiz_text += f"   Type: {q['question_type']}\n"
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
