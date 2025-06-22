from mcp_context import MCPContext
import copy

async def risk_assessment_node(context: MCPContext) -> MCPContext:
    # Mock risk assessment logic
    context.risk_assessment = {"risk_score": 0.5, "category": "moderate", "details": "Mock risk assessment"}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def market_analysis_node(context: MCPContext) -> MCPContext:
    # Mock market analysis logic
    context.market_analysis = {"sentiment": "neutral", "details": "Mock market analysis"}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def portfolio_generation_node(context: MCPContext) -> MCPContext:
    # Mock portfolio generation logic
    context.portfolio_allocation = {"stocks": 60, "bonds": 30, "cash": 10}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def report_generation_node(context: MCPContext) -> MCPContext:
    # Mock report generation logic
    context.report = "Mock report based on previous steps."
    context.history.append(copy.deepcopy(context.dict()))
    return context
