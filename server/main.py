from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from eleven_labs import text_to_speech as eleven_labs_tts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    voice_id: str | None = None


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/tts")
async def tts(request: TTSRequest):
    """Convert text to speech via Eleven Labs. Returns MP3 audio."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        audio_bytes = await eleven_labs_tts(
            request.text.strip(), voice_id=request.voice_id
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
    )


if __name__ == "__main__":
    import uvicorn
    # host 0.0.0.0 so iPad/phones on the same network can reach the server
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
