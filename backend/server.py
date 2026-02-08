from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


def get_app_classification(app_name: str) -> dict:
    """Get classification for an app, with fallback for unknown apps"""
    normalized = normalize_app_name(app_name)

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
    except:
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
