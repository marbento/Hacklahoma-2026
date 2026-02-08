"""
Test script to test the waste prediction API with input.json data.
Run this script while the FastAPI server is running.
"""

import json
from typing import Dict, List

import requests

# API base URL
BASE_URL = "http://localhost:8000"


def load_input_data(file_path: str = "input.json") -> Dict:
    """Load the input.json file"""
    with open(file_path, "r") as f:
        return json.load(f)


def extract_app_usage_from_history(data: Dict) -> List[Dict]:
    """Extract app usage entries from the history and today sections"""
    app_usage_list = []

    # Extract from history
    if "history" in data:
        for day in data["history"]:
            if "behaviorLog" in day:
                for entry in day["behaviorLog"]:
                    app_usage_list.append(
                        {
                            "app_name": entry["app"],
                            "time_accessed": entry["time"],
                            "duration_opened_minutes": float(entry["minutes"]),
                            "date": day.get("date"),
                            "type": entry.get("type", "unknown"),
                        }
                    )

    # Extract from today
    if "today" in data and "behaviorLog" in data["today"]:
        for entry in data["today"]["behaviorLog"]:
            app_usage_list.append(
                {
                    "app_name": entry["app"],
                    "time_accessed": entry["time"],
                    "duration_opened_minutes": float(entry["minutes"]),
                    "date": data["today"].get("date"),
                    "type": entry.get("type", "unknown"),
                }
            )

    return app_usage_list


def test_single_prediction(app_name: str, time: str, minutes: float):
    """Test a single app usage prediction"""
    url = f"{BASE_URL}/predict-waste"
    payload = {
        "app_name": app_name,
        "time_accessed": time,
        "duration_opened_minutes": minutes,
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error testing {app_name}: {e}")
        return None


def test_batch_predictions(app_usage_list: List[Dict]):
    """Test batch predictions"""
    url = f"{BASE_URL}/batch-predict"

    # Convert to API format (remove extra fields)
    payload = [
        {
            "app_name": entry["app_name"],
            "time_accessed": entry["time_accessed"],
            "duration_opened_minutes": entry["duration_opened_minutes"],
        }
        for entry in app_usage_list
    ]

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error testing batch: {e}")
        return None


def test_classify_app(app_name: str):
    """Test app classification endpoint"""
    url = f"{BASE_URL}/classify-app/{app_name}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error classifying {app_name}: {e}")
        return None


def main():
    """Main test function"""
    print("=" * 60)
    print("Testing Waste Prediction API with input.json")
    print("=" * 60)

    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Server is running: {response.json()}")
    except requests.exceptions.RequestException:
        print("✗ Error: Server is not running!")
        print("Please start the server with: uvicorn server:app --reload")
        return

    # Load input data
    print("\n1. Loading input.json...")
    try:
        data = load_input_data()
        print("✓ Loaded input.json")
    except FileNotFoundError:
        print("✗ Error: input.json not found!")
        return
    except json.JSONDecodeError as e:
        print(f"✗ Error parsing JSON: {e}")
        return

    # Extract app usage
    print("\n2. Extracting app usage data...")
    app_usage_list = extract_app_usage_from_history(data)
    print(f"✓ Found {len(app_usage_list)} app usage entries")

    # Test individual predictions
    print("\n3. Testing individual predictions...")
    print("-" * 60)
    for i, entry in enumerate(app_usage_list[:5], 1):  # Test first 5 entries
        print(
            f"\n[{i}] {entry['app_name']} at {entry['time_accessed']} for {entry['duration_opened_minutes']} minutes"
        )
        result = test_single_prediction(
            entry["app_name"], entry["time_accessed"], entry["duration_opened_minutes"]
        )
        if result:
            print(f"   Category: {result['app_classification']['category']}")
            print(f"   Waste Score: {result['app_classification']['waste_score']}")
            print(f"   Predicted Wasted: {result['predicted_wasted_minutes']} minutes")
            print(f"   Waste Percentage: {result['waste_percentage']}%")
            print(f"   Recommendation: {result['recommendation']}")

    # Test batch predictions
    print("\n4. Testing batch predictions...")
    print("-" * 60)
    batch_result = test_batch_predictions(app_usage_list)
    if batch_result:
        print(f"✓ Processed {batch_result['total_sessions']} sessions")
        print(f"  Total wasted time: {batch_result['total_wasted_minutes']} minutes")
        print(
            f"  Average wasted per session: {batch_result['total_wasted_minutes'] / batch_result['total_sessions']:.2f} minutes"
        )

    # Test app classification for unique apps
    print("\n5. Testing app classification...")
    print("-" * 60)
    unique_apps = list(set(entry["app_name"] for entry in app_usage_list))
    for app_name in unique_apps[:5]:  # Test first 5 unique apps
        print(f"\nClassifying: {app_name}")
        result = test_classify_app(app_name)
        if result:
            print(f"   Category: {result['category']}")
            print(f"   Is Productive: {result['is_productive']}")
            print(f"   Waste Score: {result['waste_score']}")

    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
