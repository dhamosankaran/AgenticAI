from src.agents.research_manager import ResearchManager
import logging

logging.basicConfig(level=logging.INFO)

def test_search():
    # Create Research Manager instance
    manager = ResearchManager()
    
    # Test search with a simple query
    test_query = "artificial intelligence market size 2024"
    print(f"\nTesting search with query: {test_query}")
    
    results = manager.search_market_data(test_query, max_results=3)
    
    if results:
        print("\nSearch successful! Found results:")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Title: {result.get('title', 'N/A')}")
            print(f"   Link: {result.get('link', 'N/A')}")
            print(f"   Snippet: {result.get('body', 'N/A')[:200]}...")
    else:
        print("\nNo results found or error occurred")

if __name__ == "__main__":
    test_search() 