"""
Package initialization for agents
"""
from .base_agent import BaseAgent
from .market_analyst import MarketAnalyst
from .consumer_analyst import ConsumerAnalyst
from .industry_analyst import IndustryAnalyst
from .research_manager import ResearchManager

__all__ = ['MarketAnalyst', 'ConsumerExpert', 'IndustrySpecialist', 'ResearchManager'] 