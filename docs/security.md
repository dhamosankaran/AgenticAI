# Security Guidelines (MVP)

## Overview
This document describes the security measures implemented in the MVP version of the Financial Investment Advisor Agent.

## API Security

### API Key Management
API keys such as `OPENAI_API_KEY` and `ALPHA_VANTAGE_API_KEY` are managed through environment variables and loaded into the application via `pydantic-settings` in `src/config/settings.py`.

```python
# src/config/settings.py (Simplified)
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    ALPHA_VANTAGE_API_KEY: str
    # ... other settings

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
```
These keys are then accessed throughout the application via the `settings` object.

### SECRET_KEY Configuration
A `SECRET_KEY` is defined in `src/config/settings.py`.
```python
# src/config/settings.py (Relevant part)
class Settings(BaseSettings):
    # ...
    SECRET_KEY: str = "NEEDS_TO_BE_REPLACED_BY_A_REAL_SECRET_KEY"
    # ...
```
**Important:** The default value `"NEEDS_TO_BE_REPLACED_BY_A_REAL_SECRET_KEY"` is a placeholder and **MUST** be replaced with a strong, unique secret key in any production or non-local development environment. This key is critical for security features like signing JWTs (if implemented in the future).

### CORS (Cross-Origin Resource Sharing)
CORS is configured in `src/api/main.py` using settings defined in `src/config/settings.py`. The current configuration is more restrictive than allowing all origins and specifies allowed origins, methods, and headers.

```python
# src/api/main.py (Relevant part)
from src.config.settings import settings
# ...
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS, # e.g., ["http://localhost:5173", "YOUR_PRODUCTION_URL_HERE"]
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS, # e.g., ["*"]
    allow_headers=settings.CORS_HEADERS, # e.g., ["*"]
)
```

### Rate Limiting
Parameters for rate limiting (`RATE_LIMIT` and `RATE_LIMIT_WINDOW`) are defined in `src/config/settings.py`.
```python
# src/config/settings.py (Relevant part)
class Settings(BaseSettings):
    # ...
    RATE_LIMIT: int = 100
    RATE_LIMIT_WINDOW: int = 60
    # ...
```
However, the active enforcement of rate limiting via middleware is currently a "Future Enhancement" and not yet implemented in `src/api/main.py`.

## Data Security

### Input Validation
Input validation is implicitly handled by Pydantic models used in FastAPI request bodies. If incoming data doesn't conform to the model's type hints or validation rules (e.g., `Field` constraints), FastAPI automatically returns a 422 Unprocessable Entity error.

Here's an example from `src/models/user_profile.py`:
```python
# src/models/user_profile.py (Relevant part)
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class InvestmentPreference(BaseModel):
    asset_type: str
    allocation_percentage: float = Field(ge=0, le=100) # Validation: 0 <= percentage <= 100
    risk_tolerance: str = "moderate"
    is_active: bool = True

class UserProfile(BaseModel):
    user_id: str
    name: str
    age: int # Pydantic ensures 'age' is an integer
    income: float
    risk_tolerance: str
    investment_goal: str
    investment_horizon: str
    preferences: List[InvestmentPreference] = []
    # ...
```
FastAPI leverages these models for request validation in endpoints like `/api/v1/profile`.

### Error Handling
The application uses FastAPI's built-in `HTTPException` for error handling. For critical server-side issues (500-level errors), the API has been configured to return a generic error message to the client, "An internal server error occurred.", to prevent leaking sensitive operational details. Specific error details are logged server-side for debugging.

Example from `src/api/main.py`:
```python
# src/api/main.py (Error handling in an endpoint)
@app.post("/api/v1/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    try:
        # ... business logic ...
        response = await coordinator.process_message(request.message, request.user_id)
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}") # Detailed log
        raise HTTPException(status_code=500, detail="An internal server error occurred.") # Generic message
```

### User Profile Data Storage
User profile data is currently stored in a JSON file (`data/user_profile.json`). This file contains potentially sensitive user information.

**Note on `data/user_profile.json`:**
*   **Plain Text Storage:** The data in this file is stored in plain text. For production systems or systems handling highly sensitive data, encryption at rest should be implemented for this file.
*   **Backup and Access Control:** Ensure appropriate backup procedures and access controls are in place for this file to prevent unauthorized access or data loss.
*   **Scalability:** For a larger number of users, a database solution would be more appropriate than a single JSON file. The application's settings (`src/config/settings.py`) include placeholder configurations for a PostgreSQL database, indicating potential future integration.

## Frontend Security

### Environment Variables
The frontend application (Vite + React) does not directly use a `.env` file for API URLs in the same way as the old example. Vite handles environment variables, and for development, it uses a proxy to redirect API requests.

### API Calls
Frontend API calls are made using the browser's `fetch` API to relative paths. In a development environment, Vite's proxy configuration (in `vite.config.ts`) handles redirecting these requests to the backend API server. For production, the frontend would be served by a web server that can also proxy API requests or the API would be on the same domain.

Example from `frontend/src/App.tsx`:
```typescript
// frontend/src/App.tsx (Simplified API call)
const handleProfileSubmit = async (data: UserProfileData) => {
  try {
    const res = await fetch('/api/v1/profile', { // Relative path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Failed to create profile');
    }
    // ...
  } catch (err) {
    // ...
  }
};
```
This removes the need for `axios` and `REACT_APP_API_URL` for basic API calls in the current setup.

## Best Practices (Updated)

### Development
- Use environment variables for sensitive keys (`.env` file for backend, managed by `pydantic-settings`).
- Pydantic models for input validation (backend).
- Consistent error handling (FastAPI `HTTPException`, generic 500 errors).
- Logging of errors and important events (Python `logging` module).
- Adherence to security guidelines (like this document).
- Regular dependency review and updates.

### API Security
- Centralized CORS configuration (`src/config/settings.py` and `src/api/main.py`).
- Use of HTTPS in production (responsibility of deployment environment).
- Secure API keys via environment variables.
- Placeholder for `SECRET_KEY` that **must be changed**.
- (Future) Implement rate limiting middleware.
- (Future) Implement authentication/authorization (e.g., JWT).

### Data Security
- Pydantic for input validation.
- User profile data currently in plain text (`data/user_profile.json`); consider encryption at rest for sensitive data.
- For production, use a secure database solution instead of a JSON file.
- (Future) Sanitize data if it's to be displayed back to users in HTML contexts to prevent XSS (though current use is primarily API-driven).

## Security Measures (Current Implementation)

### API Protection
- Restricted CORS policy.
- Input validation via Pydantic models.
- Generic error messages for 500-level exceptions.
- API keys loaded from environment variables.
- `SECRET_KEY` placeholder (requires user action).

### Data Protection
- Input validation for data structures.
- Error handling for data processing.
- Basic logging of errors.
- User profile data stored in a local JSON file (with noted security considerations).

## Future Enhancements
1.  **Authentication & Authorization:** Implement robust user authentication (e.g., OAuth2 with JWTs) to protect endpoints and user data.
2.  **Database Security:** Transition from JSON file storage to a secure database solution (e.g., PostgreSQL as hinted in settings) with proper access controls and encryption at rest.
3.  **Encryption for Sensitive Data:** Encrypt the `user_profile.json` file if it continues to be used, or encrypt sensitive fields in the database.
4.  **Implement Rate Limiting:** Activate middleware for the rate limiting settings already present in `src/config/settings.py`.
5.  **Security Headers:** Add security-related HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`) via middleware.
6.  **Comprehensive Logging & Monitoring:** Expand logging to include security events and integrate with monitoring tools for suspicious activity detection.
7.  **Regular Security Audits:** Conduct regular security audits and penetration testing.
8.  **Input Sanitization for Output:** If any user-provided data is rendered in HTML on the frontend (not current primary use case), ensure proper sanitization to prevent XSS.