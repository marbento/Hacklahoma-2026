# Time Saved Display Component

This component automatically calculates and displays time saved/wasted analysis on app startup.

## How It Works

1. **On Component Mount**: The component automatically loads `frontend/data/input.json`
2. **Extracts Today's Data**: Gets the `today.behaviorLog` entries
3. **Calls Backend API**: Sends a POST request to `/analyze-day` endpoint
4. **Displays Results**: Shows time saved, time wasted, net saved, and session breakdown

## Configuration

### API URL

Update `frontend/constants/api.ts` with the correct backend URL:

- **iOS Simulator**: `http://localhost:8000`
- **Android Emulator**: `http://10.0.2.2:8000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:8000` (e.g., `http://192.168.1.100:8000`)

To find your computer's IP:
- Windows: Run `ipconfig` in Command Prompt
- Mac/Linux: Run `ifconfig` or `ip addr` in Terminal

### Input Data

The component reads from `frontend/data/input.json`. Make sure this file contains the `today` object with `behaviorLog` array.

## Usage

The component is already integrated into `app/(tabs)/index.tsx` and will display automatically when the home screen loads.

## Features

- **Automatic Loading**: Calculates on component mount
- **Loading State**: Shows spinner while fetching data
- **Error Handling**: Displays error message if API call fails
- **Summary Cards**: Shows time saved, wasted, and net saved
- **Breakdown**: Displays productive vs wasteful apps
- **Session Details**: Lists all app sessions with individual metrics

## Backend Requirements

Make sure your backend server is running and the `/analyze-day` endpoint is available. The endpoint expects:

```json
{
  "date": "2026-02-08",
  "behaviorLog": [
    {
      "time": "09:10",
      "app": "Notion",
      "minutes": 35
    }
  ]
}
```
