import httpx
from datetime import datetime, timedelta
from typing import List, Optional
from config.settings import get_settings

settings = get_settings()
GCAL_API = "https://www.googleapis.com/calendar/v3"


async def get_upcoming_events(access_token: str, days_ahead: int = 7) -> List[dict]:
    now = datetime.utcnow().isoformat() + "Z"
    time_max = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + "Z"
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GCAL_API}/calendars/primary/events",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"timeMin": now, "timeMax": time_max, "singleEvents": True, "orderBy": "startTime", "maxResults": 50},
        )
        resp.raise_for_status()
        return resp.json().get("items", [])


async def create_study_event(access_token: str, title: str, start_time: datetime, duration_minutes: int, description: str = "") -> dict:
    end_time = start_time + timedelta(minutes=duration_minutes)
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GCAL_API}/calendars/primary/events",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={
                "summary": f"📚 Trail: {title}", "description": description,
                "start": {"dateTime": start_time.isoformat(), "timeZone": "UTC"},
                "end": {"dateTime": end_time.isoformat(), "timeZone": "UTC"},
                "colorId": "9",
                "reminders": {"useDefault": False, "overrides": [{"method": "popup", "minutes": 10}]},
            },
        )
        resp.raise_for_status()
        return resp.json()
