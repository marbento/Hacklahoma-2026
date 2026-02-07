"""
Eleven Labs text-to-speech: call their API and return MP3 bytes.
Set ELEVEN_LABS_API_KEY in the environment.
"""
import os
from typing import Optional

import httpx

ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel
MODEL_ID = "eleven_turbo_v2_5"


def get_api_key() -> Optional[str]:
    return os.environ.get("ELEVEN_LABS_API_KEY") or None


def is_configured() -> bool:
    key = get_api_key()
    return bool(key and key.strip())


async def text_to_speech(text: str) -> bytes:
    """
    Convert text to speech using Eleven Labs TTS.
    Returns MP3 audio bytes. Raises if API key is missing or request fails.
    """
    api_key = get_api_key()
    if not api_key or not api_key.strip():
        raise ValueError(
            "Eleven Labs API key is not configured. Set ELEVEN_LABS_API_KEY."
        )

    url = f"{ELEVEN_LABS_API_URL}/{DEFAULT_VOICE_ID}"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "Content-Type": "application/json",
                "xi-api-key": api_key.strip(),
                "Accept": "audio/mpeg",
            },
            json={"text": text, "model_id": MODEL_ID},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Eleven Labs TTS failed: {response.status_code} {response.text}"
        )

    return response.content
