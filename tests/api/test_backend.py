#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, params=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"\n\nTesting endpoint: {url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response (first 500 chars): {json.dumps(data)[:500]}...")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

# Test all endpoints
print("Starting API tests...\n")

# Health check
test_endpoint("/api/health")

# Stats
test_endpoint("/api/stats")

# Search
test_endpoint("/api/posts/search", {"keyword": "politics", "limit": 5})

# Time series
test_endpoint("/api/timeseries", {"interval": "day"})

# Network
test_endpoint("/api/network", {"type": "subreddit"})

# Sentiment
test_endpoint("/api/sentiment", {"keyword": "politics"})

# Topics
test_endpoint("/api/topics")

# AI Insights
test_endpoint("/api/ai/insights", {"keyword": "politics"})

print("\nAPI tests completed!") 