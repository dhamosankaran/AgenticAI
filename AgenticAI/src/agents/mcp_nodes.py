from src.models.mcp_context import MCPContext
from src.agents.risk_assessment_agent import RiskAssessmentAgent
from src.agents.market_analysis_agent import MarketAnalysisAgent
from src.agents.portfolio_agent import PortfolioAgent
import copy

risk_agent = RiskAssessmentAgent()
market_agent = MarketAnalysisAgent()
portfolio_agent = PortfolioAgent()

async def risk_assessment_node(context: MCPContext) -> MCPContext:
    profile_str = str(context.user_profile)
    result = await risk_agent.assess_risk(profile_str)
    context.risk_assessment = {"raw": result}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def market_analysis_node(context: MCPContext) -> MCPContext:
    result = await market_agent.analyze_market("current")
    context.market_analysis = {"raw": result}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def portfolio_generation_node(context: MCPContext) -> MCPContext:
    profile_str = str(context.user_profile)
    result = portfolio_agent.generate_portfolio(profile_str)
    context.portfolio_allocation = {"raw": result}
    context.history.append(copy.deepcopy(context.dict()))
    return context

async def report_generation_node(context: MCPContext) -> MCPContext:
    # Compose a simple report from previous steps
    summary = context.risk_assessment.get("raw", "") if context.risk_assessment else ""
    outlook = context.market_analysis.get("raw", "") if context.market_analysis else ""
    allocation = context.portfolio_allocation.get("raw", "") if context.portfolio_allocation else ""
    report = f"Summary:\n{summary}\n\nMarket Outlook:\n{outlook}\n\nPortfolio Allocation:\n{allocation}"
    context.report = report
    context.history.append(copy.deepcopy(context.dict()))
    return context 