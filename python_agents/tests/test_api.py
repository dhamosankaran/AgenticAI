import requests
import json

def test_market_analysis():
    url = "http://0.0.0.0:8001/analyze"
    data = {
        "product_name": "Smart Watch",
        "context": "Looking for market analysis of smart watches in the US market focusing on health and fitness features",
        "temperature": 0.7
    }
    
    try:
        print("Sending request to analyze market...")
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        print("\nResponse Status:", response.status_code)
        print("\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"\nError occurred: {e}")
        if hasattr(e.response, 'text'):
            print("\nError details:")
            print(e.response.text)

if __name__ == "__main__":
    test_market_analysis() 