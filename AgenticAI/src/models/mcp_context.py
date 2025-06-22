from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class MCPContext(BaseModel):
    user_profile: Dict[str, Any]
    session_id: str
    risk_assessment: Optional[Dict[str, Any]] = None
    market_analysis: Optional[Dict[str, Any]] = None
    portfolio_allocation: Optional[Dict[str, Any]] = None
    report: Optional[str] = None
    history: List[Dict[str, Any]] = [] 