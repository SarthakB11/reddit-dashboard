"""Test script for the chat functionality."""

import requests
import json
import sys
import os
import time

# Add the parent directory to the path so we can import from the backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def test_chat_message_endpoint():
    """Test the chat message endpoint."""
    print("Testing chat message endpoint...")
    
    # Define the URL
    url = "http://localhost:5000/api/chat/message"
    
    # Define the payload
    payload = {
        "message": "What are the most popular subreddits in the dataset?"
    }
    
    # Make the request
    try:
        response = requests.post(url, json=payload)
        
        # Check if the request was successful
        if response.status_code == 200:
            print("Request successful!")
            data = response.json()
            print(f"Response: {data['response']}")
            print(f"Source: {data['source']}")
            print(f"Confidence: {data['confidence']}")
            return True
        else:
            print(f"Request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error making request: {str(e)}")
        return False

def test_chat_query_endpoint():
    """Test the chat query endpoint."""
    print("\nTesting chat query endpoint...")
    
    # Define the URL
    url = "http://localhost:5000/api/chat/query"
    
    # Define the payload
    payload = {
        "query": "What are the most popular subreddits in the dataset?"
    }
    
    # Make the request
    try:
        response = requests.post(url, json=payload)
        
        # Check if the request was successful
        if response.status_code == 200:
            print("Request successful!")
            data = response.json()
            print(f"Intent: {data['intent']}")
            print(f"Entities: {json.dumps(data['entities'], indent=2)}")
            print(f"Results: {json.dumps(data['results'], indent=2)}")
            return True
        else:
            print(f"Request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error making request: {str(e)}")
        return False

def main():
    """Main function to run the tests."""
    print("Starting chat functionality tests...\n")
    
    # Wait for the server to start
    print("Waiting for server to start...")
    time.sleep(2)
    
    # Test the chat message endpoint
    message_result = test_chat_message_endpoint()
    
    # Test the chat query endpoint
    query_result = test_chat_query_endpoint()
    
    # Print the overall result
    print("\nTest results:")
    print(f"Chat message endpoint: {'PASS' if message_result else 'FAIL'}")
    print(f"Chat query endpoint: {'PASS' if query_result else 'FAIL'}")
    
    # Return the overall result
    return message_result and query_result

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 