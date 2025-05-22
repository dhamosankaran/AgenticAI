"""
FastAPI application for Financial Investment Advisor Agent System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import logging
import uuid

from src.agents import CoordinatorAgent
from langchain_openai import ChatOpenAI
from src.services.user_profile_service import UserProfileService
from src.models.user_profile import UserProfile, InvestmentPreference

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Financial Investment Advisor API",
    description="API for the Financial Investment Advisor Agent System",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the coordinator agent
coordinator = CoordinatorAgent()
user_profile_service = UserProfileService()

# Define request/response models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None

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
    preferences: List[Dict]

# Define routes
@app.post("/api/v1/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    """Process chat messages and return responses"""
    try:
        response = await coordinator.process_message(request.message, request.user_id)
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/profile", response_model=UserProfileResponse)
async def create_profile(request: UserProfileRequest):
    """Create a new user profile"""
    try:
        user_id = str(uuid.uuid4())
        profile = user_profile_service.create_default_profile(
            user_id=user_id,
            name=request.name,
            age=request.age,
            income=request.income
        )
        
        # Update profile with user preferences
        profile.risk_tolerance = request.risk_tolerance
        profile.investment_goal = request.investment_goal
        profile.investment_horizon = request.investment_horizon
        
        if not user_profile_service.save_profile(profile):
            raise HTTPException(status_code=500, detail="Failed to save profile")
        
        return UserProfileResponse(
            user_id=profile.user_id,
            name=profile.name,
            risk_tolerance=profile.risk_tolerance,
            investment_goal=profile.investment_goal,
            investment_horizon=profile.investment_horizon,
            preferences=[p.model_dump() for p in profile.preferences]
        )
    except Exception as e:
        logger.error(f"Error creating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/portfolio/summary")
async def get_portfolio_summary():
    """Get user's portfolio summary"""
    try:
        summary = user_profile_service.get_portfolio_summary()
        if "error" in summary:
            raise HTTPException(status_code=404, detail=summary["error"])
        return summary
    except Exception as e:
        logger.error(f"Error getting portfolio summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 