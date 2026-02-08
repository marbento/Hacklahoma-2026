# Goals System & HealthKit Auto-Creation

## Summary of Changes

### ✅ Issue 1 & 2: Goals Creation & HealthKit Auto-Goals

**Your goals system is fully functional!** Users can:
- Manually create goals in the Tasks tab
- Goals auto-sync with HealthKit when connected
- Backend handles all CRUD operations via `/goals/` endpoints

**Auto-Goal Creation** happens when users connect HealthKit (Gear tab):
- Move Ring (Active Calories) - from Apple Watch
- Exercise Ring (Minutes) - from Apple Watch
- Stand Ring (Hours) - from Apple Watch
- Steps (8,000 daily default) - works on iPhone without Watch
- **NEW: Sleep Duration (8 hours nightly)** - added today

### ✅ Issue 3: Progress Calculation Fixed

**Before:**
- Counted starting nodes as steps
- Total: 28 nodes = 28 steps

**After:**
- Starting nodes don't count (node 0 on each trail)
- Total: 28 nodes - 2 starting nodes = **26 actual steps**
- Progress bar correctly shows: `completedSteps / 26`
- **Button locks at 100% completion** with "Trail Complete! 🎉" message

### 📱 Issue 4: Icon Not Updating

To fix the icon.png not reflecting on your phone:

```bash
# Option 1: Clear cache and restart
npx expo start --clear

# Option 2: If that doesn't work, rebuild the app
npx expo run:ios

# Option 3: Delete the app from your phone and reinstall
# (Sometimes iOS caches the icon aggressively)
```

---

## How Auto-Goal Creation Works

### Frontend (useGoals Hook)

**File:** `frontend/hooks/useGoals.ts`

**Function:** `bootstrapAppleRings()` - runs once on app startup

1. Requests HealthKit permissions for: active_calories, exercise_minutes, stand_hours, steps, sleep_duration
2. Queries Apple Activity Summary (gets user's ring targets from Apple Watch)
3. Checks which auto-tracked goals already exist (avoids duplicates)
4. Creates missing goals:
   - Move Ring → Active Calories goal (e.g., "Burn 520 cal (Move Ring)")
   - Exercise Ring → Exercise Minutes goal (e.g., "Exercise 30 min")
   - Stand Ring → Stand Hours goal (e.g., "Stand 12 hours")
   - Steps → Daily Steps goal (8,000 steps)
   - **Sleep → Sleep Duration goal (8 hours nightly)**

### Backend (Goals Router)

**File:** `backend/routers/goals_router.py`

**Endpoint:** `POST /goals/sync` - bulk sync from HealthKit

- Receives array of goal logs from device
- For `auto_track` goals: upserts today's value (replaces, doesn't accumulate)
- For manual goals: adds new log entries
- Computes streaks automatically
- Returns sync results

---

## Bedtime/App Lockdown Integration

**What you mentioned:** "sleeping early (aka triggering the lock down of apps at a certain time)"

**Current State:**
- Sleep goal exists and tracks sleep duration from HealthKit
- Nudge/shield system exists for app lockdowns (Device Activity framework)

**To Add Bedtime Lockdowns:**

1. **Create a bedtime reminder goal** with a specific time (e.g., 10:00 PM)
2. **Link to nudge system** - when bedtime approaches, trigger app shields
3. **Use `reminder_time` field** in goal schema to set bedtime
4. **Backend scheduler job** could check at intervals and notify frontend to activate shields

**Implementation Suggestion:**
```typescript
// In frontend when creating bedtime goal:
{
  title: "Bedtime at 10:00 PM",
  metric: "sleep_duration",
  category: "sleep",
  reminder_time: "22:00", // 10 PM
  target_value: 8,
  frequency: "daily"
}

// In gear.tsx or nudge setup:
// When reminder_time approaches, activate Device Activity shields
// Block distracting apps until morning
```

---

## Key Files

| Component | File Path |
|-----------|-----------|
| Goals API | `backend/routers/goals_router.py` |
| Goals Hook | `frontend/hooks/useGoals.ts` |
| HealthKit Service | `frontend/services/healthKitService.ts` |
| Tasks Screen | `frontend/app/(tabs)/tasks.tsx` |
| Gear/Settings | `frontend/app/(tabs)/gear.tsx` |
| Trail Progress | `frontend/app/(tabs)/index.tsx` |

---

## What's Working Now

✅ Users can create goals manually in Tasks tab
✅ HealthKit auto-creates fitness + sleep goals when connected
✅ Goals sync automatically with HealthKit data
✅ Trail progress correctly calculates 26 total steps
✅ "Take Step" button locks at 100% completion
✅ Avatar customizations update immediately when switching tabs
✅ Streak tracking works automatically
✅ Backend handles all CRUD operations

## Next Steps (Optional Enhancements)

- Add bedtime reminder that triggers app shields at specified time
- Create backend scheduler job for bedtime lockdowns
- Add more HealthKit metrics (water intake, mindful minutes, workouts)
- Allow users to customize default targets for auto-goals
- Show HealthKit sync status in Gear tab
