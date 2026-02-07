from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from eleven_labs import text_to_speech as eleven_labs_tts

app = FastAPI()


class TTSRequest(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/tts")
async def tts(request: TTSRequest):
    """Convert text to speech via Eleven Labs. Returns MP3 audio."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        audio_bytes = await eleven_labs_tts(request.text.strip())
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
    )