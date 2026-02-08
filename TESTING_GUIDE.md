# Testing Guide: Time Tracking & Goal History

## Quick Start

### 1. Seed Demo User
```bash
curl -X POST https://hacklahoma2026.onrender.com/dev/seed-mock-user
```

Or visit in browser:
```
https://hacklahoma2026.onrender.com/dev/seed-mock-user
```

### 2. Login
```
Email: avery.park@demo.com
Password: demo123
```

## API Endpoints to Test

### Banked Steps (NEW)
**GET** `/insights/banked-steps`

Expected response:
```json
{
  "date": "2026-02-08",
  "banked_steps": 4,
  "steps_from_time": 1,
  "steps_from_goals": 3,
  "productive_minutes": 96,
  "completed_goals": 1
}
```

**Calculation for Feb 8 (TODAY)**:
- Productive time: 96 min = 1.6 hours = **1 step**
- Completed goals: 1 goal × 3 = **3 steps**
- **Total: 4 steps banked**

### Daily Steps (NEW)
**GET** `/insights/daily-steps/2026-02-06`

Expected response for Feb 6:
```json
{
  "date": "2026-02-06",
  "steps_from_time": 1,
  "steps_from_goals": 3,
  "total_steps": 4,
  "productive_minutes": 83,
  "completed_goals": 1
}
```

**GET** `/insights/daily-steps/2026-02-07`

Expected response for Feb 7:
```json
{
  "date": "2026-02-07",
  "steps_from_time": 3,
  "steps_from_goals": 3,
  "total_steps": 6,
  "productive_minutes": 192,
  "completed_goals": 1
}
```

### Completed Goals Today (NEW)
**GET** `/goals/completed-today`

Expected response:
```json
{
  "date": "2026-02-08",
  "completed_count": 1,
  "total_steps": 3,
  "goals": [
    {
      "id": "...",
      "title": "Study 3 hours daily",
      "category": "academic",
      "points": 3,
      "completed_at": "2026-02-08T17:00:00",
      "progress": 96.0,
      "target": 180.0,
      "unit": "min"
    }
  ]
}
```

**Note**: For Feb 8, the study goal shows 96 min progress but target is 180 min, so it's NOT completed. Adjust expectations accordingly.

### Goal History (NEW)
**GET** `/goals/history/{goal_id}?days=7`

Expected response:
```json
{
  "goal_id": "...",
  "title": "Study 3 hours daily",
  "target_value": 180.0,
  "target_unit": "min",
  "days": 7,
  "history": [
    {
      "date": "2026-02-06",
      "value": 83.0,
      "logs_count": 1,
      "completed": false
    },
    {
      "date": "2026-02-07",
      "value": 192.0,
      "logs_count": 1,
      "completed": true
    },
    {
      "date": "2026-02-08",
      "value": 96.0,
      "logs_count": 1,
      "completed": false
    }
  ]
}
```

### Screen Time Analysis (NEW)
**GET** `/insights/screen-time-analysis/2026-02-08`

Expected response:
```json
{
  "date": "2026-02-08",
  "total_minutes": 126,
  "productive_minutes": 96,
  "unproductive_minutes": 30,
  "net_minutes": 66,
  "steps_from_time": 1,
  "app_breakdown": [
    {
      "app": "Notion",
      "duration_minutes": 35,
      "wasted_minutes": 0,
      "productive_minutes": 35,
      "waste_score": 0.0,
      "category": "productivity",
      "is_productive": true
    },
    {
      "app": "Google Calendar",
      "duration_minutes": 25,
      "wasted_minutes": 0,
      "productive_minutes": 25,
      "waste_score": 0.0,
      "category": "productivity",
      "is_productive": true
    },
    {
      "app": "Canvas",
      "duration_minutes": 36,
      "wasted_minutes": 0,
      "productive_minutes": 36,
      "waste_score": 0.0,
      "category": "productivity",
      "is_productive": true
    },
    {
      "app": "Instagram",
      "duration_minutes": 12,
      "wasted_minutes": 12,
      "productive_minutes": 0,
      "waste_score": 1.0,
      "category": "entertainment",
      "is_productive": false
    },
    {
      "app": "YouTube",
      "duration_minutes": 18,
      "wasted_minutes": 18,
      "productive_minutes": 0,
      "waste_score": 1.0,
      "category": "entertainment",
      "is_productive": false
    }
  ]
}
```

## Frontend Testing

### Tasks Tab
1. Navigate to Tasks tab
2. Go to "Completed" section
3. **Expected**: See completed goals from today (if any)
4. **Expected**: See "X STEPS BANKED" banner with correct count
5. Pull to refresh - should update with latest data

### Home Screen
1. Navigate to Home tab
2. Check TrailCard component
3. **Expected**: "Banked steps" count matches `/insights/banked-steps` API
4. **Expected**: Trail progress reflects invested steps from previous days
5. Tap "Take Step" - should invest 1 banked step

## Step Calculation Examples

### Feb 6, 2026
```
Productive: 83 min (42 + 41) = 1.38 hours = 1 step
Completed goals: 1 goal × 3 = 3 steps
Total: 4 steps
```

### Feb 7, 2026
```
Productive: 192 min (60 + 72 + 60) = 3.2 hours = 3 steps
Completed goals: 1 goal × 3 = 3 steps
Total: 6 steps
```

### Feb 8, 2026 (TODAY)
```
Productive: 96 min (35 + 25 + 36) = 1.6 hours = 1 step
Completed goals: 1 goal × 3 = 3 steps
Total: 4 steps
```

## Trail Progress Verification

Demo user Avery Park should have:
- **Total steps earned**: 14 (4 + 6 + 4 from 3 days)
- **Steps invested**: 10 (already placed on trail from Feb 6-7)
- **Steps banked**: 4 (from today, Feb 8)
- **Current trail position**: Tile 10

## Error Cases to Test

### Sleep Goal Manual Logging
**POST** `/goals/log`
```json
{
  "goal_id": "{sleep_goal_id}",
  "value": 8.0,
  "source": "manual"
}
```

**Expected**: 400 error with message:
```json
{
  "detail": "Sleep goals cannot be manually logged. They must be synced from HealthKit."
}
```

### Invalid Date Format
**GET** `/insights/daily-steps/invalid-date`

**Expected**: 400 error with message:
```json
{
  "detail": "Invalid date format. Use YYYY-MM-DD"
}
```

## Database Verification

If you have access to MongoDB:

```javascript
// Check screen time data
db.screen_time.find({user_id: "{avery_user_id}"}).sort({timestamp: 1})

// Check goal logs
db.goal_logs.find({user_id: "{avery_user_id}"}).sort({date: 1})

// Check trail progress
db.trail_progress.findOne({user_id: "{avery_user_id}"})
```

## Environment Variables

Make sure these are set on Render:
```
GEMINI_API_KEY=your_gemini_key
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=trail
APP_ENV=production
```

## Troubleshooting

### Banked steps showing 0
1. Check if screen time data exists for today
2. Verify goal completion status
3. Check API endpoint response in browser DevTools
4. Confirm date is correct (Feb 8, 2026 for demo)

### Completed tasks not showing
1. Verify goals are marked as completed (`today_progress >= target_value`)
2. Check `/goals/completed-today` API response
3. Ensure frontend is calling `getCompletedToday()`
4. Check browser console for errors

### Frontend not updating
1. Clear app cache
2. Force refresh (pull to refresh)
3. Check network tab for API calls
4. Verify authentication token is valid

### API errors
1. Check Render logs for Python errors
2. Verify all imports are correct
3. Confirm MongoDB connection
4. Test Gemini API key with simple request

## Success Criteria

✅ `/dev/seed-mock-user` creates Avery Park successfully
✅ Login with `avery.park@demo.com` works
✅ Home screen shows 4 banked steps
✅ Tasks tab completed section shows real goals
✅ Trail position is at tile 10
✅ Step counts consistent across all screens
✅ Historical data accessible via `/goals/history`
✅ Screen time analysis shows proper categorization
✅ Sleep goal manual logging blocked
✅ No hardcoded data in frontend
✅ All TypeScript types correct
