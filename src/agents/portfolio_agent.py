"""
Portfolio Management Agent for generating investment recommendations
"""

from typing import Dict, List, Optional
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
import numpy as np
from datetime import datetime, timedelta

from .base_agent import BaseFinancialAgent

class PortfolioAgent(BaseFinancialAgent):
    """Agent responsible for portfolio management and recommendations"""
    
    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        tools: Optional[List[Tool]] = None,
    ):
        # Define system prompt for portfolio management
        system_prompt = """You are an expert portfolio management agent. Your role is to:
        1. Generate personalized investment portfolios
        2. Analyze portfolio performance
        3. Suggest portfolio rebalancing
        4. Provide portfolio optimization recommendations
        
        Always consider the user's risk profile, investment goals, and market conditions when making portfolio decisions."""
        
        # Define portfolio management tools
        portfolio_tools = [
            Tool(
                name="generate_portfolio",
                func=self.generate_portfolio,
                description="Generate a portfolio based on user profile and risk assessment"
            ),
            Tool(
                name="analyze_portfolio_performance",
                func=self.analyze_portfolio_performance,
                description="Analyze the performance of a given portfolio"
            ),
            Tool(
                name="rebalance_portfolio",
                func=self.rebalance_portfolio,
                description="Suggest portfolio rebalancing based on current allocation and target allocation"
            ),
        ]
        
        # Combine provided tools with portfolio tools
        all_tools = (tools or []) + portfolio_tools
        
        # Initialize base class
        super().__init__(
            llm=llm,
            tools=all_tools,
            system_prompt=system_prompt
        )
    
    def generate_portfolio(self, profile: Dict | str) -> str:
        """Generate a portfolio based on user profile and risk assessment."""
        try:
            # Handle both string and dictionary inputs
            if isinstance(profile, str):
                risk_level = profile.lower()
            else:
                risk_level = profile.get("risk_level", "moderate").lower()
            
            # Define target allocations based on risk level
            allocations = {
                "conservative": {
                    "stocks": 0.30,
                    "bonds": 0.50,
                    "cash": 0.15,
                    "real_estate": 0.05
                },
                "moderate": {
                    "stocks": 0.60,
                    "bonds": 0.30,
                    "cash": 0.05,
                    "real_estate": 0.05
                },
                "aggressive": {
                    "stocks": 0.80,
                    "bonds": 0.10,
                    "cash": 0.05,
                    "real_estate": 0.05
                }
            }
            
            # Get allocation for risk level
            target_allocation = allocations.get(risk_level, allocations["moderate"])
            
            # Format allocation as string
            allocation_str = "\n".join(
                f"{asset.capitalize()}: {weight*100:.1f}%"
                for asset, weight in target_allocation.items()
            )
            
            return f"Recommended Portfolio Allocation ({risk_level.capitalize()} Risk):\n{allocation_str}"
        except Exception as e:
            return f"Error generating portfolio: {str(e)}"
    
    def analyze_portfolio_performance(self, portfolio: Dict[str, float]) -> str:
        """Analyze the performance of a given portfolio."""
        try:
            # Calculate portfolio metrics
            total_value = sum(portfolio.values())
            if total_value == 0:
                return "Portfolio is empty"
            
            # Calculate allocation percentages
            allocation = {
                asset: (value / total_value) * 100
                for asset, value in portfolio.items()
            }
            
            # Format analysis
            analysis = "Portfolio Analysis:\n"
            analysis += "\nCurrent Allocation:\n"
            for asset, percentage in allocation.items():
                analysis += f"{asset.capitalize()}: {percentage:.1f}%\n"
            
            # Add diversification score
            diversification_score = self._calculate_diversification_score(allocation)
            analysis += f"\nDiversification Score: {diversification_score:.1f}/100"
            
            return analysis
        except Exception as e:
            return f"Error analyzing portfolio performance: {str(e)}"
    
    def rebalance_portfolio(self, current_portfolio: Dict[str, float], target_allocation: Dict[str, float]) -> str:
        """Suggest portfolio rebalancing based on current and target allocations."""
        try:
            total_value = sum(current_portfolio.values())
            if total_value == 0:
                return "Portfolio is empty"
            
            # Calculate current allocation percentages
            current_allocation = {
                asset: (value / total_value) * 100
                for asset, value in current_portfolio.items()
            }
            
            # Calculate rebalancing needs
            rebalancing = {}
            for asset in set(current_allocation.keys()) | set(target_allocation.keys()):
                current = current_allocation.get(asset, 0)
                target = target_allocation.get(asset, 0)
                diff = target - current
                if abs(diff) > 1:  # Only suggest changes if difference is more than 1%
                    rebalancing[asset] = diff
            
            if not rebalancing:
                return "Portfolio is well-balanced. No rebalancing needed."
            
            # Format rebalancing suggestions
            suggestions = "Rebalancing Suggestions:\n"
            for asset, diff in rebalancing.items():
                action = "Increase" if diff > 0 else "Decrease"
                suggestions += f"{action} {asset.capitalize()} by {abs(diff):.1f}%\n"
            
            return suggestions
        except Exception as e:
            return f"Error suggesting rebalancing: {str(e)}"
    
    def _calculate_diversification_score(self, allocation: Dict[str, float]) -> float:
        """Calculate a diversification score based on portfolio allocation."""
        try:
            # Calculate Herfindahl-Hirschman Index (HHI)
            hhi = sum((percentage / 100) ** 2 for percentage in allocation.values())
            
            # Convert HHI to a 0-100 score (lower HHI = higher diversification)
            diversification_score = (1 - hhi) * 100
            
            return diversification_score
        except Exception as e:
            return 0.0
    
    async def process_message(self, message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Process a message and return a response"""
        return self.generate_portfolio(message) 