# Testing Guide

## Testing with input.json

This guide shows you how to test the waste prediction API using the `input.json` file.

### Prerequisites

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```bash
   cd backend
   uvicorn server:app --reload
   ```

   The server will run on `http://localhost:8000`

### Running the Test Script

Run the automated test script:

```bash
cd backend
python test_with_input.py
```

This script will:
- Load data from `input.json`
- Extract app usage entries from `history` and `today` sections
- Test individual predictions for each app usage
- Test batch predictions
- Test app classification for unique apps

### Manual Testing with curl

#### Single Prediction

```bash
curl -X POST "http://localhost:8000/predict-waste" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Instagram",
    "time_accessed": "14:30",
    "duration_opened_minutes": 30.0
  }'
```

#### Batch Prediction

```bash
curl -X POST "http://localhost:8000/batch-predict" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "app_name": "Instagram",
      "time_accessed": "14:30",
      "duration_opened_minutes": 30.0
    },
    {
      "app_name": "Notion",
      "time_accessed": "09:05",
      "duration_opened_minutes": 42.0
    }
  ]'
```

#### Classify App

```bash
curl "http://localhost:8000/classify-app/Instagram"
```

### Testing with Python requests

```python
import requests
import json

# Load input.json
with open("input.json", "r") as f:
    data = json.load(f)

# Extract first behavior log entry
entry = data["today"]["behaviorLog"][0]

# Test prediction
response = requests.post(
    "http://localhost:8000/predict-waste",
    json={
        "app_name": entry["app"],
        "time_accessed": entry["time"],
        "duration_opened_minutes": entry["minutes"]
    }
)

print(json.dumps(response.json(), indent=2))
```

### Expected Output

The test script will show:
- Individual predictions with waste scores, categories, and recommendations
- Batch prediction summary with total wasted time
- App classifications for unique apps

Example output:
```
[1] Instagram at 13:30 for 12.0 minutes
   Category: social_media
   Waste Score: 0.9
   Predicted Wasted: 12.96 minutes
   Waste Percentage: 100.0%
   Recommendation: wasteful
```
