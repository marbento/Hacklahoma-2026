# Demo User Setup for Hacklahoma 2026

## Quick Start

### 1. Seed the Demo User

Call the development endpoint to create "Avery Park" with 3 days of realistic history:

```bash
curl -X POST https://hacklahoma2026.onrender.com/dev/seed-mock-user
```

Or visit in browser:
```
https://hacklahoma2026.onrender.com/dev/seed-mock-user
```

### 2. Login Credentials

```
Email: avery.park@demo.com
Password: demo123
```

## What You Get

### User Profile
- **Name**: Avery Park
- **Created**: Feb 5, 2026
- **Active Days**: 3 (Feb 6-8, 2026)

### Trail Progress
- **Total Steps Earned**: 14
  - Feb 6: 4 steps (1 from productive hours + 3 from task)
  - Feb 7: 6 steps (3 from productive hours + 3 from task)
  - Feb 8: 4 steps (1 from productive hours + 3 from task)
- **Steps Invested**: 10 (current trail position: tile 10)
- **Steps Banked**: 4 (ready to invest today)

### Goals (3)
1. **Study 3 hours daily** (Academic)
   - Target: 180 min/day
   - Current streak: 3 days
   - Status: ✅ Completed today

2. **Morning workout** (Fitness)
   - Target: 30 min/day
   - Auto-tracked via HealthKit
   - Current streak: 2 days

3. **Sleep 8 hours** (Sleep)
   - Target: 8 hrs/day
   - Auto-tracked via HealthKit
   - Current streak: 3 days

### Screen Time History

**Feb 6, 2026** (83 min productive, 36 min wasted)
- 09:05 - Notion (42 min) ✅
- 10:20 - Google Calendar (41 min) ✅
- 14:10 - Instagram (18 min) ⚠️
- 16:40 - YouTube (18 min) ⚠️

**Feb 7, 2026** (192 min productive, 66 min wasted)
- 08:30 - Notion (60 min) ✅
- 09:45 - Canvas (72 min) ✅
- 13:15 - Microsoft 365 (60 min) ✅
- 15:00 - Reddit (28 min) ⚠️
- 18:10 - YouTube (38 min) ⚠️

**Feb 8, 2026** (96 min productive, 30 min wasted)
- 09:10 - Notion (35 min) ✅
- 10:00 - Google Calendar (25 min) ✅
- 13:30 - Instagram (12 min) ⚠️
- 15:05 - Canvas (36 min) ✅
- 17:40 - YouTube (18 min) ⚠️

### Assignments (2)

1. **CS 2334 - Data Structures**
   - Project 2: Binary Search Tree
   - Due: Feb 12, 2026
   - Points: 100
   - Status: Upcoming

2. **ENGL 1113 - Composition**
   - Essay 2: Rhetorical Analysis
   - Due: Feb 15, 2026
   - Points: 150
   - Status: Upcoming

## Step Calculation Logic

### Formula
```
Steps per hour of productive time: 1 step
Steps per completed task: 3 steps
```

### Example (Feb 7)
```
Productive minutes: 192 min = 3.2 hours = 3 steps
Tasks completed: 1 task = 3 steps
Total: 3 + 3 = 6 steps earned
```

## Testing the Demo

1. **Login** with avery.park@demo.com / demo123
2. **View Trail**: See 10 steps already invested (trail position)
3. **Check Banked Steps**: 4 steps ready to invest
4. **View Goals**: 3 active goals with history
5. **Check Assignments**: 2 upcoming assignments
6. **Screen Time**: Review 3 days of app usage history
7. **Take Steps**: Use the 4 banked steps to progress on trail

## Resetting Demo Data

Simply re-run the seed endpoint to reset everything:
```bash
curl -X POST https://hacklahoma2026.onrender.com/dev/seed-mock-user
```

This will:
- Delete existing Avery Park user
- Recreate all goals, logs, assignments, and trail progress
- Reset to fresh demo state

## API Endpoint Details

**POST** `/dev/seed-mock-user`

Response:
```json
{
  "success": true,
  "message": "Mock user created successfully",
  "user": {
    "id": "...",
    "email": "avery.park@demo.com",
    "password": "demo123",
    "name": "Avery Park"
  },
  "stats": {
    "goals": 3,
    "goal_logs": 3,
    "screen_time_logs": 14,
    "assignments": 2,
    "total_steps_earned": 14,
    "steps_invested": 10,
    "steps_banked": 4
  }
}
```

## Notes

- This endpoint is **development-only** and won't work in production
- All dates are set to Feb 5-8, 2026 for consistency
- Screen time data matches the JSON mock structure from Discord
- Trail progress follows the exact algorithm: net productive hours + 3 per task
