from src.models.mcp_context import MCPContext
from src.agents.mcp_nodes import (
    risk_assessment_node,
    market_analysis_node,
    portfolio_generation_node,
    report_generation_node,
)

import asyncio

async def run_mcp_workflow(context: MCPContext) -> MCPContext:
    context = await risk_assessment_node(context)
    context = await market_analysis_node(context)
    context = await portfolio_generation_node(context)
    context = await report_generation_node(context)
    return context 