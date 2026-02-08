import json
import os
from datetime import datetime
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data Models
class AppUsageRequest(BaseModel):
    app_name: str
    time_accessed: str  # ISO format or "HH:MM"
    duration_opened_minutes: float
    date: Optional[str] = None  # Optional date


class AppClassification(BaseModel):
    app_name: str
    category: str
    is_productive: bool
    waste_score: float  # 0.0 (productive) to 1.0 (very wasteful)


class BehaviorLogEntry(BaseModel):
    time: str  # "HH:MM" format
    app: str
    minutes: float


class DailyUsageRequest(BaseModel):
    date: Optional[str] = None
    behaviorLog: List[BehaviorLogEntry]


# Constants
DEFAULT_WASTEFUL_BASELINE = 0.85  # Average social media waste score for comparison


# App Classification Database
APP_CLASSIFICATIONS = {
    # Social Media (High Waste)
    "instagram": {
        "category": "social_media",
        "is_productive": False,
        "waste_score": 0.9,
    },
    "facebook": {
        "category": "social_media",
        "is_productive": False,
        "waste_score": 0.85,
    },
    "tiktok": {"category": "social_media", "is_productive": False, "waste_score": 0.95},
    "twitter": {"category": "social_media", "is_productive": False, "waste_score": 0.8},
    "x": {"category": "social_media", "is_productive": False, "waste_score": 0.8},
    "snapchat": {
        "category": "social_media",
        "is_productive": False,
        "waste_score": 0.9,
    },
    "reddit": {"category": "social_media", "is_productive": False, "waste_score": 0.75},
    # Entertainment (Medium-High Waste)
    "youtube": {
        "category": "entertainment",
        "is_productive": False,
        "waste_score": 0.7,
    },
    "netflix": {
        "category": "entertainment",
        "is_productive": False,
        "waste_score": 0.85,
    },
    "spotify": {
        "category": "entertainment",
        "is_productive": False,
        "waste_score": 0.4,
    },
    "twitch": {"category": "entertainment", "is_productive": False, "waste_score": 0.8},
    # Productivity (Low Waste)
    "gmail": {"category": "productivity", "is_productive": True, "waste_score": 0.2},
    "outlook": {"category": "productivity", "is_productive": True, "waste_score": 0.2},
    "calendar": {"category": "productivity", "is_productive": True, "waste_score": 0.1},
    "notes": {"category": "productivity", "is_productive": True, "waste_score": 0.15},
    "notion": {"category": "productivity", "is_productive": True, "waste_score": 0.2},
    "todoist": {"category": "productivity", "is_productive": True, "waste_score": 0.15},
    "trello": {"category": "productivity", "is_productive": True, "waste_score": 0.2},
    "slack": {"category": "productivity", "is_productive": True, "waste_score": 0.3},
    "teams": {"category": "productivity", "is_productive": True, "waste_score": 0.3},
    # Education (Low Waste)
    "coursera": {"category": "education", "is_productive": True, "waste_score": 0.2},
    "khan academy": {
        "category": "education",
        "is_productive": True,
        "waste_score": 0.2,
    },
    "duolingo": {"category": "education", "is_productive": True, "waste_score": 0.25},
    # Games (High Waste)
    "games": {"category": "gaming", "is_productive": False, "waste_score": 0.9},
    "candy crush": {"category": "gaming", "is_productive": False, "waste_score": 0.9},
    "among us": {"category": "gaming", "is_productive": False, "waste_score": 0.85},
}


def normalize_app_name(app_name: str) -> str:
    """Normalize app name for lookup"""
    return app_name.lower().strip()


def classify_app_with_gemini(app_name: str) -> Optional[dict]:
    """
    Use Gemini AI to classify an app and determine if it's wasteful.
    Returns None if Gemini is unavailable or fails.
    """
    if not GEMINI_API_KEY:
        return None

    try:
        # Initialize the model
        model = genai.GenerativeModel("gemini-pro")

        # Create a prompt for Gemini
        prompt = f"""Analyze the following mobile/desktop application and classify it based on productivity and time-wasting potential.

App Name: {app_name}

Please provide a JSON response with the following structure:
{{
    "category": "one of: social_media, entertainment, productivity, education, gaming, communication, utility, unknown",
    "is_productive": true or false,
    "waste_score": a float between 0.0 (very productive) and 1.0 (very wasteful)
}}

Guidelines:
- Social media apps (Instagram, Facebook, TikTok, Twitter, etc.) should have waste_score 0.7-0.95
- Entertainment apps (YouTube, Netflix, games) should have waste_score 0.4-0.9 depending on context
- Productivity apps (email, calendar, notes, task managers) should have waste_score 0.1-0.3
- Education apps should have waste_score 0.2-0.3
- Communication apps (Slack, Teams) can be productive but may have moderate waste_score 0.3-0.4
- Gaming apps should have waste_score 0.8-0.95

Return ONLY valid JSON, no additional text."""

        # Generate response
        response = model.generate_content(prompt)

        # Parse the response
        response_text = response.text.strip()

        # Clean up the response (remove markdown code blocks if present)
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        # Parse JSON
        classification = json.loads(response_text)

        # Validate and normalize the response
        category = classification.get("category", "unknown")
        is_productive = bool(classification.get("is_productive", False))
        waste_score = float(classification.get("waste_score", 0.5))

        # Clamp waste_score to valid range
        waste_score = max(0.0, min(1.0, waste_score))

        return {
            "category": category,
            "is_productive": is_productive,
            "waste_score": waste_score,
        }
    except Exception as e:
        # Log error but don't raise - fallback to database
        print(f"Gemini classification failed for '{app_name}': {str(e)}")
        return None


def get_app_classification(app_name: str) -> dict:
    """
    Get classification for an app.
    First tries Gemini AI, then falls back to database lookup, then default.
    """
    normalized = normalize_app_name(app_name)

    # Try Gemini AI classification first
    gemini_result = classify_app_with_gemini(app_name)
    if gemini_result:
        return gemini_result

    # Fallback to database lookup
    # Direct match
    if normalized in APP_CLASSIFICATIONS:
        return APP_CLASSIFICATIONS[normalized]

    # Partial match (e.g., "com.instagram.app" contains "instagram")
    for known_app, classification in APP_CLASSIFICATIONS.items():
        if known_app in normalized or normalized in known_app:
            return classification

    # Default for unknown apps - moderate waste score
    return {"category": "unknown", "is_productive": False, "waste_score": 0.5}


def get_time_factor(time_str: str) -> float:
    """Calculate time-based waste factor (higher during work hours, lower during breaks)"""
    try:
        # Parse time (assuming HH:MM format)
        if ":" in time_str:
            hour = int(time_str.split(":")[0])
        else:
            # Try parsing ISO format
            dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            hour = dt.hour
    except (ValueError, AttributeError, KeyError):
        hour = 12  # Default to noon

    # Work hours (9 AM - 5 PM) = higher waste factor
    if 9 <= hour < 17:
        return 1.2  # 20% more wasteful during work hours
    # Late night (11 PM - 2 AM) = higher waste factor
    elif 23 <= hour or hour < 2:
        return 1.3  # 30% more wasteful late at night
    # Morning (6 AM - 9 AM) = lower waste factor
    elif 6 <= hour < 9:
        return 0.8  # 20% less wasteful in morning
    # Evening (5 PM - 11 PM) = moderate
    else:
        return 1.0


def predict_wasted_time(
    app_name: str, time_accessed: str, duration_opened_minutes: float
) -> dict:
    """
    Predict wasted time based on app classification, time of access, and duration.

    Formula:
    wasted_time = duration * waste_score * time_factor

    Where:
    - waste_score: 0.0 (productive) to 1.0 (very wasteful)
    - time_factor: Multiplier based on time of day
    """
    classification = get_app_classification(app_name)
    time_factor = get_time_factor(time_accessed)

    waste_score = classification["waste_score"]
    time_factor = get_time_factor(time_accessed)

    # Calculate wasted time
    wasted_minutes = duration_opened_minutes * waste_score * time_factor

    # Cap at actual duration (can't waste more than time spent)
    wasted_minutes = min(wasted_minutes, duration_opened_minutes)

    return {
        "predicted_wasted_minutes": round(wasted_minutes, 2),
        "actual_duration_minutes": duration_opened_minutes,
        "waste_percentage": round((wasted_minutes / duration_opened_minutes) * 100, 2)
        if duration_opened_minutes > 0
        else 0,
        "app_classification": {
            "app_name": app_name,
            "category": classification["category"],
            "is_productive": classification["is_productive"],
            "waste_score": waste_score,
        },
        "time_factor": round(time_factor, 2),
        "recommendation": "productive"
        if classification["is_productive"]
        else "wasteful",
    }


def predict_saved_time(
    app_name: str, time_accessed: str, duration_opened_minutes: float
) -> dict:
    """
    Predict saved time based on app classification compared to a wasteful baseline.

    Formula:
    saved_time = duration * (baseline_waste_score - waste_score) * time_factor

    Where:
    - baseline_waste_score: DEFAULT_WASTEFUL_BASELINE (0.85)
    - waste_score: 0.0 (productive) to 1.0 (very wasteful)
    - time_factor: Multiplier based on time of day

    Positive values indicate time saved (productive apps).
    Negative values indicate opportunity cost (wasteful apps).
    """
    classification = get_app_classification(app_name)
    time_factor = get_time_factor(time_accessed)
    waste_score = classification["waste_score"]

    # Calculate saved time (positive for productive apps, negative for wasteful apps)
    saved_minutes = (
        duration_opened_minutes
        * (DEFAULT_WASTEFUL_BASELINE - waste_score)
        * time_factor
    )

    # Calculate save percentage relative to baseline
    baseline_wasted = duration_opened_minutes * DEFAULT_WASTEFUL_BASELINE * time_factor
    save_percentage = (
        round((saved_minutes / baseline_wasted) * 100, 2) if baseline_wasted > 0 else 0
    )

    return {
        "predicted_saved_minutes": round(saved_minutes, 2),
        "actual_duration_minutes": duration_opened_minutes,
        "save_percentage": save_percentage,
        "app_classification": {
            "app_name": app_name,
            "category": classification["category"],
            "is_productive": classification["is_productive"],
            "waste_score": waste_score,
        },
        "time_factor": round(time_factor, 2),
        "baseline_waste_score": DEFAULT_WASTEFUL_BASELINE,
        "recommendation": "time_saved" if saved_minutes > 0 else "opportunity_cost",
    }


def analyze_daily_usage(
    behavior_log: List[BehaviorLogEntry], date: Optional[str] = None
) -> dict:
    """
    Analyze a day's app usage and return comprehensive summary.

    Processes each behavior log entry, calculates time saved and wasted,
    and aggregates totals by category and app type.
    """
    total_duration = 0.0
    total_time_saved = 0.0
    total_time_wasted = 0.0

    productive_count = 0
    productive_minutes = 0.0
    productive_saved = 0.0

    wasteful_count = 0
    wasteful_minutes = 0.0
    wasteful_wasted = 0.0

    by_category = {}
    sessions = []

    for entry in behavior_log:
        app_name = entry.app
        time_accessed = entry.time
        duration = entry.minutes

        # Calculate wasted and saved time
        wasted_result = predict_wasted_time(app_name, time_accessed, duration)
        saved_result = predict_saved_time(app_name, time_accessed, duration)

        wasted_minutes = wasted_result["predicted_wasted_minutes"]
        saved_minutes = saved_result["predicted_saved_minutes"]

        classification = get_app_classification(app_name)
        category = classification["category"]
        is_productive = classification["is_productive"]

        # Accumulate totals
        total_duration += duration
        total_time_wasted += wasted_minutes
        total_time_saved += saved_minutes if saved_minutes > 0 else 0

        # Track by productivity
        if is_productive:
            productive_count += 1
            productive_minutes += duration
            productive_saved += saved_minutes if saved_minutes > 0 else 0
        else:
            wasteful_count += 1
            wasteful_minutes += duration
            wasteful_wasted += wasted_minutes

        # Track by category
        if category not in by_category:
            by_category[category] = {"minutes": 0.0, "saved": 0.0, "wasted": 0.0}

        by_category[category]["minutes"] += duration
        if saved_minutes > 0:
            by_category[category]["saved"] += saved_minutes
        else:
            by_category[category]["wasted"] += wasted_minutes

        # Add session details
        sessions.append(
            {
                "app": app_name,
                "time": time_accessed,
                "duration_minutes": round(duration, 2),
                "time_saved": round(saved_minutes, 2),
                "time_wasted": round(wasted_minutes, 2),
                "category": category,
                "is_productive": is_productive,
            }
        )

    # Calculate net time saved
    net_time_saved = total_time_saved - total_time_wasted

    # Round category totals
    for category in by_category:
        by_category[category]["minutes"] = round(by_category[category]["minutes"], 2)
        by_category[category]["saved"] = round(by_category[category]["saved"], 2)
        by_category[category]["wasted"] = round(by_category[category]["wasted"], 2)

    return {
        "date": date,
        "total_duration_minutes": round(total_duration, 2),
        "total_time_saved_minutes": round(total_time_saved, 2),
        "total_time_wasted_minutes": round(total_time_wasted, 2),
        "net_time_saved_minutes": round(net_time_saved, 2),
        "breakdown": {
            "productive_apps": {
                "count": productive_count,
                "total_minutes": round(productive_minutes, 2),
                "time_saved": round(productive_saved, 2),
            },
            "wasteful_apps": {
                "count": wasteful_count,
                "total_minutes": round(wasteful_minutes, 2),
                "time_wasted": round(wasteful_wasted, 2),
            },
        },
        "by_category": by_category,
        "sessions": sessions,
    }


# API Endpoints


@app.get("/")
def read_root():
    return {"message": "Time Wasting Prediction API"}


@app.post("/predict-waste")
async def predict_waste(request: AppUsageRequest):
    """
    Predict wasted time for a given app usage session.

    Example request:
    {
        "app_name": "Instagram",
        "time_accessed": "14:30",
        "duration_opened_minutes": 30.0
    }
    """
    try:
        result = predict_wasted_time(
            request.app_name, request.time_accessed, request.duration_opened_minutes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/classify-app/{app_name}")
async def classify_app(app_name: str):
    """
    Get classification for a specific app.
    """
    classification = get_app_classification(app_name)
    return {
        "app_name": app_name,
        "category": classification["category"],
        "is_productive": classification["is_productive"],
        "waste_score": classification["waste_score"],
    }


@app.get("/apps/all")
async def get_all_apps():
    """
    Get all known app classifications.
    """
    apps = []
    for app_name, classification in APP_CLASSIFICATIONS.items():
        apps.append({"app_name": app_name, **classification})
    return {"apps": apps, "total": len(apps)}


@app.post("/assess-app")
async def assess_app(app_name: str, user_feedback: Optional[str] = None):
    """
    Programmatically assess an app and optionally update classification.
    This could be extended to use ML models or user feedback.
    """
    classification = get_app_classification(app_name)

    # Assessment logic (can be enhanced with ML)
    assessment = {
        "app_name": app_name,
        "current_classification": classification,
        "assessment": {
            "is_productive": classification["is_productive"],
            "waste_level": "high"
            if classification["waste_score"] > 0.7
            else "medium"
            if classification["waste_score"] > 0.4
            else "low",
            "recommendation": "Limit usage"
            if classification["waste_score"] > 0.6
            else "Moderate usage"
            if classification["waste_score"] > 0.3
            else "Safe to use",
        },
    }

    return assessment


@app.post("/batch-predict")
async def batch_predict(requests: List[AppUsageRequest]):
    """
    Predict wasted time for multiple app usage sessions.
    """
    results = []
    total_wasted = 0

    for request in requests:
        result = predict_wasted_time(
            request.app_name, request.time_accessed, request.duration_opened_minutes
        )
        results.append(result)
        total_wasted += result["predicted_wasted_minutes"]

    return {
        "sessions": results,
        "total_wasted_minutes": round(total_wasted, 2),
        "total_sessions": len(results),
    }


@app.post("/analyze-day")
async def analyze_day(request: DailyUsageRequest):
    """
    Analyze a day's app usage and return comprehensive summary.

    Accepts daily usage data with behavior log entries and returns:
    - Total time saved (from productive apps)
    - Total time wasted (from wasteful apps)
    - Net time saved
    - Breakdown by category and app type
    - Individual session details

    Example request:
    {
        "date": "2026-02-08",
        "behaviorLog": [
            {
                "time": "09:10",
                "app": "Notion",
                "minutes": 35.0
            },
            {
                "time": "13:30",
                "app": "Instagram",
                "minutes": 12.0
            }
        ]
    }
    """
    try:
        result = analyze_daily_usage(request.behaviorLog, request.date)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
