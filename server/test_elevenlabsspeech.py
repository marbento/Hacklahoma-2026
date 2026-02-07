"""
Test script to verify the Eleven Labs API key and TTS.
Run from server dir: python test_elevenlabsspeech.py
"""
import asyncio
from dotenv import load_dotenv

load_dotenv()

from eleven_labs import get_api_key, is_configured, text_to_speech


async def main() -> None:
    print("Checking Eleven Labs configuration...")
    if not is_configured():
        print("FAIL: API key not set. Set ELEVEN_LABS_API_KEY in .env")
        return
    key = get_api_key()
    print(f"OK: API key found (starts with {key[:8]}...)")

    print("Calling Eleven Labs TTS for 'Hello' (male voice)...")
    try:
        audio_bytes = await text_to_speech("Hello", voice_id="pNInz6obpgDQGcFmaJgB")
        print(f"OK: Received {len(audio_bytes)} bytes of MP3 audio.")
        print("API key works.")
    except ValueError as e:
        print(f"FAIL (config): {e}")
    except RuntimeError as e:
        print(f"FAIL (API): {e}")
    except Exception as e:
        print(f"FAIL: {e}")


if __name__ == "__main__":
    asyncio.run(main())
