# Backend Development

## Overview
This document describes the backend implementation for the Financial Investment Advisor Agent system. The backend is built using Python and FastAPI, providing a series of API endpoints for user interaction, financial data retrieval, and agent-based processing.

## Technical Stack

### Core Technologies
- Python 3.9+ (as specified in development environment)
- FastAPI: For building the RESTful API.
- Pydantic: For data validation and settings management.
- JSON file (`data/user_profile.json`): Currently used for storing user profile data.
    - Note: `src/config/settings.py` includes configurations for PostgreSQL, and `requirements.txt` lists `sqlalchemy` and `psycopg2-binary`, indicating that database integration is a planned or partially implemented feature.
- Financial Data APIs:
    - Alpha Vantage: For general market data.
    - Yahoo Finance (`yfinance`): For stock-specific data.
- Langchain & OpenAI: For LLM-based agentic functionalities.

### Key Dependencies
Key dependencies are listed in `requirements.txt`. Some core ones include:
```
fastapi
uvicorn
pydantic
python-dotenv
langchain
langchain-openai
openai
alpha_vantage
yfinance
aiohttp
```

## Project Structure
The project follows a structured layout:
```
src/
├── agents/           # Contains different agent implementations (coordinator, analysis, etc.)
├── api/              # FastAPI application and endpoint definitions
│   └── main.py       # Main FastAPI application entry point and router setup
├── config/           # Configuration management
│   └── settings.py   # Pydantic-based application settings
├── models/           # Pydantic models for data structures (e.g., user profiles)
│   └── user_profile.py
├── services/         # Business logic services (e.g., market data, user profile management)
│   ├── market_data_service.py
│   └── user_profile_service.py
└── (other modules/packages as needed)

data/
└── user_profile.json # Default storage for user profile data
```
The main application is run via `uvicorn src.api.main:app`.

## Models
The primary data models are defined in `src/models/user_profile.py` using Pydantic. These models define the structure and validation rules for data used in API requests and responses.

### UserProfile Model
This model stores comprehensive information about a user, including their financial details, risk appetite, and investment preferences.
```python
# src/models/user_profile.py (Simplified UserProfile)
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class InvestmentPreference(BaseModel):
    asset_type: str
    allocation_percentage: float = Field(ge=0, le=100)
    risk_tolerance: str = "moderate"
    is_active: bool = True

class UserProfile(BaseModel):
    user_id: str
    name: str
    age: int
    income: float
    risk_tolerance: str
    investment_goal: str
    investment_horizon: str
    preferences: List[InvestmentPreference] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = { # Example for OpenAPI docs
            "example": {
                "user_id": "user123",
                "name": "John Doe",
                "age": 35,
                # ... other fields
            }
        }
```

### Request/Response Models
Specific models are defined in `src/api/main.py` for handling requests and responses for particular endpoints, such as `ChatRequest`, `ChatResponse`, `UserProfileRequest`, and `UserProfileResponse`.

```python
# src/api/main.py (Example: UserProfileRequest)
from pydantic import BaseModel
from typing import List, Dict # Dict added for UserProfileResponse

class UserProfileRequest(BaseModel):
    name: str
    age: int
    income: float
    risk_tolerance: str
    investment_goal: str
    investment_horizon: str

class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    risk_tolerance: str
    investment_goal: str
    investment_horizon: str
    preferences: List[Dict] # Reflects actual usage in main.py
```

## Implementation

### API Endpoints
API endpoints are defined in `src/api/main.py` using FastAPI. Key endpoints include:

*   **POST `/api/v1/profile`**: Creates a new user profile.
    *   Request Body: `UserProfileRequest`
    *   Response Body: `UserProfileResponse`
*   **POST `/api/v1/chat`**: Processes a chat message with the financial advisor agent.
    *   Request Body: `ChatRequest` (includes `message` and optional `user_id`)
    *   Response Body: `ChatResponse`
*   **GET `/api/v1/portfolio/summary`**: Retrieves the user's portfolio summary. (Assumes profile exists).
*   **GET `/api/v1/health`**: A health check endpoint.

Example of the `/api/v1/profile` endpoint:
```python
# src/api/main.py (Simplified profile creation endpoint)
from fastapi import FastAPI, HTTPException
# ... other imports ...
from src.models.user_profile import UserProfile # For UserProfileService interaction
from .models import UserProfileRequest, UserProfileResponse # Request/Response models from main.py
from src.services.user_profile_service import UserProfileService
import uuid

app = FastAPI() # Assuming app is defined
user_profile_service = UserProfileService()

@app.post("/api/v1/profile", response_model=UserProfileResponse)
async def create_profile(request: UserProfileRequest):
    try:
        user_id = str(uuid.uuid4())
        # Simplified: In actual code, UserProfileService creates the profile object
        # then updates it with request data.
        # Here we directly map for brevity in docs.
        
        # UserProfileService would handle the creation and saving
        # For the purpose of this doc, showing the mapping:
        profile_data_for_service = request.model_dump()
        profile_data_for_service["user_id"] = user_id
        
        # Assume user_profile_service.create_and_save_profile(profile_data_for_service)
        # and it returns the saved profile.
        # For the response, we construct UserProfileResponse.
        
        # This part is a conceptual representation for the docs.
        # The actual implementation detail is in user_profile_service.save_profile
        # and the endpoint returns UserProfileResponse.
        
        # Example:
        # profile = user_profile_service.create_default_profile(...)
        # profile.risk_tolerance = request.risk_tolerance ...
        # user_profile_service.save_profile(profile)
        # return UserProfileResponse(user_id=profile.user_id, ..., preferences=[p.model_dump() for p in profile.preferences])

        # The example below is simplified for documentation purposes
        # to show the request and response structure.
        # Actual logic involves UserProfileService.
        
        # This is a conceptual representation for the docs.
        # The actual implementation is more detailed in `src/api/main.py`
        # For example:
        # saved_profile = user_profile_service.create_and_save_profile(user_id, request)
        # return UserProfileResponse(**saved_profile.model_dump())
        
        # Placeholder for actual logic which involves UserProfileService
        # The code in src/api/main.py is the source of truth.
        # This is just to illustrate endpoint structure.
        
        # Corrected and simplified representation for docs:
        # (Actual implementation uses UserProfileService)
        created_profile = user_profile_service.create_default_profile(
            user_id=user_id,
            name=request.name,
            age=request.age,
            income=request.income
        )
        created_profile.risk_tolerance = request.risk_tolerance
        created_profile.investment_goal = request.investment_goal
        created_profile.investment_horizon = request.investment_horizon
        
        if not user_profile_service.save_profile(created_profile):
            raise HTTPException(status_code=500, detail="Failed to save profile")

        return UserProfileResponse(
            user_id=created_profile.user_id,
            name=created_profile.name,
            risk_tolerance=created_profile.risk_tolerance,
            investment_goal=created_profile.investment_goal,
            investment_horizon=created_profile.investment_horizon,
            preferences=[p.model_dump() for p in created_profile.preferences]
        )
    except Exception as e:
        # logger.error(...)
        raise HTTPException(status_code=500, detail="An internal server error occurred.")
```

### Services
The business logic is encapsulated in service classes found in `src/services/`.

#### MarketDataService
Located in `src/services/market_data_service.py`, this service is responsible for fetching financial data from external sources.
*   It initializes without an API key in its constructor; API keys are retrieved from `settings` (loaded from environment variables).
*   It uses `aiohttp` for asynchronous requests to Alpha Vantage.
*   It uses the `yfinance` library for fetching stock data from Yahoo Finance. Synchronous `yfinance` calls are wrapped with `asyncio.to_thread` to prevent blocking the asyncio event loop.
*   Provides methods like `get_stock_data` and `get_market_summary`.

```python
# src/services/market_data_service.py (Conceptual Structure)
import asyncio
import aiohttp
import yfinance as yf
from src.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self):
        self.alpha_vantage_key = settings.ALPHA_VANTAGE_API_KEY
        self.alpha_vantage_url = settings.ALPHA_VANTAGE_BASE_URL
        # ...

    def _fetch_yahoo_finance_data_sync(self, symbol: str, period: str = "1d"):
        # ... yf.Ticker(symbol).history(period=period) ...
        pass

    async def get_stock_data(self, symbol: str, period: str = "1d"):
        return await asyncio.to_thread(self._fetch_yahoo_finance_data_sync, symbol, period)

    async def _fetch_alpha_vantage(self, session, url, params):
        # ... session.get(...) ...
        pass
        
    # Other methods like get_market_data, get_market_summary...
```

#### UserProfileService
Located in `src/services/user_profile_service.py`, this service manages user profiles.
*   Handles CRUD operations for user profiles (currently using `data/user_profile.json`).
*   Provides methods like `get_profile`, `save_profile`, `create_default_profile`, and `get_portfolio_summary`.

```python
# src/services/user_profile_service.py (Conceptual Structure)
from src.models.user_profile import UserProfile
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class UserProfileService:
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.profile_file = self.data_dir / "user_profile.json"
        # ...

    def get_profile(self, user_id: str = None) -> UserProfile | None:
        # ... loads from self.profile_file ...
        pass

    def save_profile(self, profile: UserProfile) -> bool:
        # ... saves to self.profile_file ...
        pass
        
    # Other methods...
```

#### Agent Services
The `src/agents/` directory contains various agent classes (e.g., `CoordinatorAgent`, `MarketAnalysisAgent`) that leverage LLMs (via Langchain and OpenAI) to provide intelligent financial advice and analysis. The `CoordinatorAgent` is typically the entry point for processing user messages.

## Testing
Tests are located in the `tests/` directory. `pytest` is used as the testing framework.

### API Tests
API tests use `fastapi.testclient.TestClient` to make requests to the application.
Example from `tests/test_api.py`:
```python
# tests/test_api.py (Example: test_create_profile)
from fastapi.testclient import TestClient
from src.api.main import app # Import the FastAPI app instance

client = TestClient(app)

def test_create_profile(client, user_profile_service): # user_profile_service fixture for isolated data
    profile_data = {
        "name": "Test User",
        "age": 30,
        "income": 100000,
        "risk_tolerance": "moderate",
        "investment_goal": "balanced_growth",
        "investment_horizon": "long-term"
    }
    
    response = client.post("/api/v1/profile", json=profile_data)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["name"] == profile_data["name"]
    # ... other assertions ...
```

### Service Tests
Service tests directly instantiate service classes and test their methods. (Refer to specific test files in `tests/` for examples if available, e.g., `test_user_profile_service.py`).

## Best Practices

### Development
- Consistent use of type hints.
- Adherence to FastAPI best practices for structuring applications.
- Centralized configuration using `pydantic-settings` in `src/config/settings.py`.
- Environment variables for sensitive information and deployment-specific settings (managed via `.env` file and `pydantic-settings`).
- Comprehensive logging using Python's `logging` module.
- Modular design with separation of concerns (API, services, models, agents).
- Asynchronous programming (`async/await`) for I/O-bound operations.

### API Design
- RESTful principles for endpoint design.
- Clear and consistent request/response models using Pydantic.
- Appropriate use of HTTP status codes.
- Input validation handled by FastAPI based on Pydantic models.
- Generic error messages for 500-level errors to prevent information leakage, with detailed server-side logging.

## Future Enhancements
1.  **Full Database Integration:** Transition user profile storage from JSON to a robust database system (e.g., PostgreSQL, as suggested by settings and dependencies). Implement Alembic for database migrations.
2.  **User Authentication & Authorization:** Implement a secure authentication mechanism (e.g., OAuth2 with JWTs) to protect user-specific endpoints.
3.  **Implement Rate Limiting:** Activate the rate limiting middleware based on the configuration already present in `src/config/settings.py`.
4.  **Advanced Agent Capabilities:** Enhance agents with more sophisticated financial analysis tools, memory, and personalization features.
5.  **Expanded Data Sources:** Integrate more diverse financial data sources (e.g., news sentiment, alternative data).
6.  **Task Queues for Long-Running Operations:** For computationally intensive agent tasks or external API calls, implement a task queue (e.g., Celery) to improve API responsiveness.
7.  **Caching Strategies:** Implement or expand caching for frequently accessed, non-volatile data to reduce external API calls and improve performance (cache settings are present in `src/config/settings.py`).
8.  **More Comprehensive Testing:** Increase test coverage, particularly for agent interactions and complex service logic.