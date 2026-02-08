# Gemini API Setup

To use Gemini AI for app classification, you need to set up a Gemini API key.

## Steps:

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Create a `.env` file in the `backend` directory with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How it works:

- The system will first try to classify apps using Gemini AI
- If Gemini is unavailable or fails, it falls back to the existing database lookup
- If the app is not in the database, it uses a default classification

The Gemini integration provides intelligent classification for apps not in the predefined database.
