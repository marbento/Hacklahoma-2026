# The Trail 🥾

**The Trail** is a productivity app that helps college students stay focused on their goals through gentle nudges, visual progress tracking, and Canvas LMS integration.

## Features

- **🎯 Goal Tracking**: Set and track daily goals with streak monitoring
- **📚 Canvas Integration**: Automatically sync assignments and courses from Canvas LMS
- **🥾 Trail Visualization**: Visual progress system with avatar that moves along trails as you complete goals
- **⏰ Smart Nudges**: Get gentle reminders when opening distracting apps
- **📊 Time Tracking**: Monitor productive vs. unproductive time
- **🎵 Sound Effects**: Celebratory sounds for milestones and progress
- **🤖 AI Assistance**: Gemini AI generates study plans and personalized insights
- **💪 Fitness Integration**: Track fitness goals (iOS HealthKit support)

## Tech Stack

### Frontend
- **React Native** with **Expo** (SDK 54)
- **TypeScript**
- **Expo Router** for navigation
- **expo-av** for audio playback
- **react-native-device-activity** for Screen Time integration (iOS)
- **react-native-health** for fitness tracking (iOS)

### Backend
- **FastAPI** (Python)
- **MongoDB** with Motor (async driver)
- **Google Gemini AI** for study plans and encouragement
- **JWT** authentication
- **APScheduler** for background jobs

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** database (local or MongoDB Atlas)
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Development**: Xcode 15+ (for iOS builds)
- **Android Development**: Android Studio (for Android builds)

## Project Structure

```
Hacklahoma-2026/
├── frontend/               # React Native app
│   ├── app/               # Expo Router pages
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── api/               # API client
│   └── assets/            # Images, sounds, fonts
├── backend/               # FastAPI server
│   ├── routers/           # API route handlers
│   ├── services/          # Business logic
│   ├── schemas/           # Pydantic models
│   ├── config/            # Configuration
│   └── main.py            # App entry point
└── modules/
    └── expo-screen-time/  # Custom iOS Screen Time module
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hacklahoma-2026
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/trail
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Keys:**
- **MongoDB**: Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Gemini API**: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Run the Backend

```bash
# From backend/ directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure API Endpoint

Update the API base URL in `frontend/api/client.ts`:

```typescript
const API_BASE = "http://localhost:8000";  // For local development
// const API_BASE = "https://your-backend.onrender.com";  // For production
```

#### Run the App

```bash
# From frontend/ directory
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

### 4. Seed Demo Data (Optional)

To create a demo user with sample data:

```bash
cd backend
python seed_mock_user.py
```

**Demo credentials:**
- Email: `demo@trail.app`
- Password: `password123`

## Running the Full Stack

### Terminal 1 - Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npx expo start
```

## API Documentation

Once the backend is running, visit:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

## Key Features Setup

### Canvas Integration

1. Log in to the app
2. Go to **Profile** tab → **Connect to Canvas**
3. Enter your Canvas instance URL (e.g., `canvas.instructure.com`)
4. Enter your Canvas API token
   - Get token: Canvas → Account → Settings → New Access Token

### Screen Time Nudges (iOS Only)

1. App requests Screen Time permissions on iOS
2. Select apps to monitor in **Gear** tab
3. Set nudge schedules and messages
4. When opening blocked apps, you'll see gentle nudges

### Goals & Trail Progress

1. Go to **Goals** tab
2. Create daily goals (e.g., "Study 2 hours", "Exercise 30 min")
3. Log progress throughout the day
4. Banked steps accumulate based on completed goals
5. Use steps on **Home** tab to move along the trail

## Sound Files

Audio files are located in `frontend/assets/audio/`:
- `opensound.mp3` - Plays when home screen loads
- `footstepsound.mp3` - Plays when taking steps on trail
- `trumpet.mp3` - Plays when completing trail
- `accomplished.mp3` - Plays after trumpet celebration

## Deployment

### Backend (Render)

1. Create new Web Service on [Render](https://render.com)
2. Connect your repository
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (`MONGODB_URI`, `GEMINI_API_KEY`)

### Frontend (EAS Build)

```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running and connection string is correct
- Check Python version: `python --version` (should be 3.8+)
- Verify all environment variables are set

### Frontend won't connect to backend
- Check API_BASE URL in `frontend/api/client.ts`
- Ensure backend is running on the specified port
- For physical devices, use your computer's IP address instead of `localhost`

### Expo build errors
- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Expo SDK compatibility with dependencies

## License

MIT License - built for Hacklahoma 2026

## Contributors

Built with ❤️ for helping students stay on their path
