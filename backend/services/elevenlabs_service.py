import httpx
import base64
from config.settings import get_settings

settings = get_settings()
ELEVENLABS_API = "https://api.elevenlabs.io/v1"


async def text_to_speech(text: str, voice_id: str = None) -> bytes:
    vid = voice_id or settings.elevenlabs_voice_id
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{ELEVENLABS_API}/text-to-speech/{vid}",
            headers={"xi-api-key": settings.elevenlabs_api_key, "Content-Type": "application/json"},
            json={"text": text, "model_id": "eleven_turbo_v2_5", "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3}},
        )
        resp.raise_for_status()
        return resp.content


async def text_to_speech_base64(text: str, voice_id: str = None) -> str:
    audio_bytes = await text_to_speech(text, voice_id)
    return base64.b64encode(audio_bytes).decode("utf-8")
