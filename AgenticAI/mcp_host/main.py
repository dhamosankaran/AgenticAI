from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
import uuid
from mcp_context import MCPContext
from mcp_nodes import (
    risk_assessment_node,
    market_analysis_node,
    portfolio_generation_node,
    report_generation_node,
)
import asyncio

app = FastAPI(title="MCP Host Server")

# In-memory session store
sessions: Dict[str, MCPContext] = {}

class CreateSessionRequest(BaseModel):
    user_profile: Dict

class StepRequest(BaseModel):
    step: str  # "risk_assessment", "market_analysis", "portfolio_generation", "report_generation"

@app.post("/mcp/session")
def create_session(req: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    context = MCPContext(user_profile=req.user_profile, session_id=session_id, history=[])
    sessions[session_id] = context
    return {"session_id": session_id, "context": context.dict()}

@app.post("/mcp/session/{session_id}/step")
async def advance_step(session_id: str, req: StepRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    context = sessions[session_id]
    if req.step == "risk_assessment":
        context = await risk_assessment_node(context)
    elif req.step == "market_analysis":
        context = await market_analysis_node(context)
    elif req.step == "portfolio_generation":
        context = await portfolio_generation_node(context)
    elif req.step == "report_generation":
        context = await report_generation_node(context)
    else:
        raise HTTPException(status_code=400, detail="Invalid step")
    sessions[session_id] = context
    return {"context": context.dict()}

@app.get("/mcp/session/{session_id}")
def get_context(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    context = sessions[session_id]
    return {"context": context.dict()}
