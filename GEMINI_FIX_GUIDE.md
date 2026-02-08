# 🔥 GEMINI FIX GUIDE - GET IT WORKING NOW!

## ✅ What's Already Fixed

1. **Model Name**: ✅ Using `gemini-pro` (correct!)
2. **Error Handling**: ✅ Comprehensive try-catch blocks added
3. **Logging**: ✅ Detailed console output for debugging
4. **Fallback Plans**: ✅ Returns default plan if API fails

## 🚀 Quick Test

### Step 1: Test Locally (Mac)
```bash
cd /Users/ebod/Projects/Hacklahoma-2026/backend

# Set your API key
export GEMINI_API_KEY="your_api_key_here"

# Run the test script
python3 test_gemini.py
```

**Expected Output:**
```
🚀 Starting Gemini API Test...

============================================================
🔍 GEMINI API TEST - Comprehensive Diagnostics
============================================================

1️⃣ Checking API Key Configuration...
✅ GEMINI_API_KEY is set!
   Length: 39 characters
   Starts with: AIza...

2️⃣ Testing Study Plan Generation...
📡 Calling Gemini API...
✅ Gemini API responded!
📝 Response length: 847 characters
✅ Successfully parsed JSON response
✅ Study Plan Generated Successfully!
   Estimated time: 180 minutes
   Key concepts: 5 concepts
   Subtasks: 6 tasks
   Encouragement: You've got this! Break down...

3️⃣ Testing Encouragement Generation...
✅ Encouragement Generated Successfully!
   Message: Great progress today! You're crushing...

4️⃣ Testing Nudge Message Generation...
✅ Nudge Generated Successfully!
   Title: Before you scroll...
   Subtitle: Remember: Finish homework by Friday...

============================================================
✅ ALL GEMINI TESTS PASSED!
============================================================

✨ Gemini is working correctly!
```

### Step 2: Deploy to Render

#### A. Set Environment Variable on Render
1. Go to https://dashboard.render.com
2. Click on your service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your API key (starts with `AIza...`)
6. Click "Save Changes"
7. **Deploy** (Render will auto-deploy or click "Manual Deploy")

#### B. Check Render Logs
After deploying, check the logs for:
```
✅ Gemini API key found (length: 39)
✅ Using Gemini model: gemini-pro
```

If you see:
```
❌ ERROR: GEMINI_API_KEY environment variable is not set!
```
Then go back to step A and make sure you added the variable.

## 🔍 Where to Get Your API Key

### Option 1: Google AI Studio (Recommended)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Option 2: Google Cloud Console
1. Go to https://console.cloud.google.com
2. Enable "Generative Language API"
3. Go to "Credentials"
4. Create API key

## 🐛 Common Issues & Fixes

### Issue 1: "API key not set"
**Error:**
```
❌ ERROR: GEMINI_API_KEY environment variable is not set!
```

**Fix:**
- On Render: Add `GEMINI_API_KEY` in Environment tab
- Locally: Run `export GEMINI_API_KEY="your_key"`
- Verify: API key should start with "AIza"

### Issue 2: "Resource has been exhausted" (Quota)
**Error:**
```
429 Resource has been exhausted (e.g. check quota).
```

**Fix:**
- Check quota at https://aistudio.google.com/app/apikey
- Free tier: 15 requests/minute, 1,500 requests/day
- Wait a minute and try again
- Or upgrade to paid tier

### Issue 3: "Model not found"
**Error:**
```
404 models/gemini-xxx is not found
```

**Fix:**
✅ Already fixed! Using `gemini-pro`

### Issue 4: JSON Parsing Error
**Error:**
```
⚠️ JSON parsing failed: Expecting value...
```

**Fix:**
✅ Already handled! Returns fallback plan with:
- 60 minute estimate
- 3 basic subtasks
- Encouragement message

### Issue 5: Network Timeout
**Error:**
```
TimeoutError: Request timed out
```

**Fix:**
- Check internet connection
- Gemini API might be down (check https://status.cloud.google.com/)
- Fallback plan will be returned automatically

## 📊 How to Test in Production

### Test Study Plan Endpoint
```bash
# Get your auth token first
TOKEN=$(curl -X POST https://hacklahoma2026.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"avery.park@demo.com","password":"demo123"}' | jq -r .access_token)

# Create an assignment first
ASSIGNMENT_ID=$(curl -X POST https://hacklahoma2026.onrender.com/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "course_name": "CS 101",
    "description": "Test description",
    "due_at": "2026-02-15T23:59:00Z",
    "points_possible": 100
  }' | jq -r .id)

# Generate study plan
curl -X POST https://hacklahoma2026.onrender.com/assignments/$ASSIGNMENT_ID/study-plan \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "assignment_id": "...",
  "estimated_total_minutes": 180,
  "key_concepts": ["Concept 1", "Concept 2"],
  "subtasks": [
    {
      "title": "Step 1",
      "description": "What to do",
      "estimated_minutes": 30,
      "resources": ["https://..."]
    }
  ],
  "encouragement": "You've got this! ..."
}
```

### Check Logs on Render
Look for these messages in your Render logs:
```
🎓 Generating study plan for: Test Assignment
✅ Gemini API key found (length: 39)
✅ Using Gemini model: gemini-pro
📡 Calling Gemini API...
✅ Gemini API responded!
📝 Response length: 847 characters
✅ Successfully parsed JSON response
```

## ✅ Checklist

- [ ] API key obtained from Google AI Studio
- [ ] API key added to Render environment variables
- [ ] Service redeployed on Render
- [ ] Logs show "Gemini API key found"
- [ ] Logs show "Using Gemini model: gemini-pro"
- [ ] Test script runs successfully locally
- [ ] Study plan endpoint returns valid response
- [ ] Encouragement endpoint returns messages
- [ ] No 404 or 429 errors in logs

## 🎯 Summary

**Files Modified:**
1. `backend/services/gemini_service.py` - Added comprehensive error handling
2. `backend/test_gemini.py` - New test script

**What to Do:**
1. Run `python3 test_gemini.py` locally to verify it works
2. Add `GEMINI_API_KEY` to Render environment
3. Deploy and check logs
4. Test the study plan endpoint

**If Still Not Working:**
- Check Render logs for the exact error message
- Run the test script locally to isolate the issue
- Verify API key is correct (starts with "AIza")
- Check API quota at https://aistudio.google.com/

🔥 **YOU GOT THIS!** 🔥
