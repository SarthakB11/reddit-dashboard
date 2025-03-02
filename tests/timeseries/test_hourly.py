import requests
import json

try:
    print("Testing hourly timeseries endpoint...")
    response = requests.get('http://localhost:5000/api/timeseries?interval=hour')
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Number of data points: {len(data)}")
        if len(data) > 0:
            print("Sample data (first 2 entries):")
            print(json.dumps(data[:2] if len(data) >= 2 else data, indent=2))
        else:
            print("No data points returned")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}") 