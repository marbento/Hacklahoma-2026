#!/usr/bin/env python3
"""
Test Gemini API - Run this to diagnose issues
Usage: python test_gemini.py
"""
import asyncio
import sys
from config.settings import get_settings
from services.gemini_service import generate_study_plan, generate_encouragement, generate_nudge_message
from datetime import datetime, timedelta

async def test_gemini():
    print("=" * 60)
    print("🔍 GEMINI API TEST - Comprehensive Diagnostics")
    print("=" * 60)

    # 1. Check API Key
    print("\n1️⃣ Checking API Key Configuration...")
    settings = get_settings()

    if not settings.gemini_api_key:
        print("❌ GEMINI_API_KEY is NOT set!")
        print("   Fix: Set the environment variable GEMINI_API_KEY")
        return False

    key_length = len(settings.gemini_api_key)
    key_start = settings.gemini_api_key[:10] if key_length > 10 else settings.gemini_api_key[:3]
    print(f"✅ GEMINI_API_KEY is set!")
    print(f"   Length: {key_length} characters")
    print(f"   Starts with: {key_start}...")

    # 2. Test Study Plan Generation
    print("\n2️⃣ Testing Study Plan Generation...")
    try:
        due_date = datetime.utcnow() + timedelta(days=3)
        plan = await generate_study_plan(
            assignment_title="Test Assignment: Binary Search Trees",
            course_name="CS 2334 - Data Structures",
            description="Implement a binary search tree with insert, delete, and search operations. Include comprehensive test cases.",
            points_possible=100.0,
            due_at=due_date
        )
        print("✅ Study Plan Generated Successfully!")
        print(f"   Estimated time: {plan.estimated_total_minutes} minutes")
        print(f"   Key concepts: {len(plan.key_concepts)} concepts")
        print(f"   Subtasks: {len(plan.subtasks)} tasks")
        print(f"   Encouragement: {plan.encouragement[:50]}...")
    except Exception as e:
        print(f"❌ Study Plan Generation FAILED!")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

    # 3. Test Encouragement Generation
    print("\n3️⃣ Testing Encouragement Generation...")
    try:
        message = await generate_encouragement(
            user_name="Test User",
            goals_completed=3,
            goals_total=5,
            assignments_done=2,
            current_streaks={"Study daily": 5, "Morning workout": 3},
            recent_grades=[95.0, 88.0, 92.0]
        )
        print("✅ Encouragement Generated Successfully!")
        print(f"   Message: {message}")
    except Exception as e:
        print(f"❌ Encouragement Generation FAILED!")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

    # 4. Test Nudge Generation
    print("\n4️⃣ Testing Nudge Message Generation...")
    try:
        nudge = await generate_nudge_message(
            current_goal="Finish homework by Friday",
            upcoming_assignment="CS 2334: BST Project",
            time_wasted_today=45
        )
        print("✅ Nudge Generated Successfully!")
        print(f"   Title: {nudge.get('title', 'N/A')}")
        print(f"   Subtitle: {nudge.get('subtitle', 'N/A')}")
    except Exception as e:
        print(f"❌ Nudge Generation FAILED!")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

    # 5. Summary
    print("\n" + "=" * 60)
    print("✅ ALL GEMINI TESTS PASSED!")
    print("=" * 60)
    print("\n✨ Gemini is working correctly!\n")
    return True


if __name__ == "__main__":
    print("\n🚀 Starting Gemini API Test...\n")

    # Run the async test
    result = asyncio.run(test_gemini())

    if result:
        print("✅ Success! Gemini is ready to use.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed. Please check the errors above.")
        print("\n💡 Common fixes:")
        print("   1. Make sure GEMINI_API_KEY is set in your environment")
        print("   2. Verify the API key is valid (starts with 'AIza')")
        print("   3. Check that you have API quota remaining")
        print("   4. Ensure you're using model 'gemini-2.5-flash' (fallback: gemini-3-flash-preview)")
        sys.exit(1)
