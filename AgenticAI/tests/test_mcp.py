import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_mcp_analyze_valid():
    payload = {
        "name": "Test User",
        "age": 35,
        "income": 100000,
        "risk_tolerance": "moderate",
        "investment_goal": "balanced_growth",
        "investment_horizon": "medium-term"
    }
    resp = client.post("/api/v1/mcp/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "mcp_context" in data
    assert "history" in data["mcp_context"]
    assert len(data["mcp_context"]["history"]) > 0
    assert data["used_fallback"] is False

def test_mcp_analyze_fallback():
    payload = {
        "name": "Test User",
        "age": 35,
        "income": 100000,
        "risk_tolerance": "moderate",
        "investment_goal": "balanced_growth",
        "investment_horizon": "medium-term",
        "fallback": True
    }
    resp = client.post("/api/v1/mcp/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["used_fallback"] is True
    assert data["fallback_response"] is not None

def test_mcp_analyze_invalid():
    payload = {
        # Missing required fields
        "name": "Test User"
    }
    resp = client.post("/api/v1/mcp/analyze", json=payload)
    assert resp.status_code == 422  # Unprocessable Entity 