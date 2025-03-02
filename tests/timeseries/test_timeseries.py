import requests
import json

try:
    response = requests.get('http://localhost:5000/api/timeseries?interval=day')
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Number of data points: {len(data)}")
        print("Sample data (first 2 entries):")
        print(json.dumps(data[:2], indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}") 