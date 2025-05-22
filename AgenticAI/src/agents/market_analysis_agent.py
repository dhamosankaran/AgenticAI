"""
Market Analysis Agent for analyzing market conditions and trends
"""

import os
from typing import Dict, List
import logging
from .base_agent import BaseFinancialAgent
from src.services.market_data_service import MarketDataService

logger = logging.getLogger(__name__)

class MarketAnalysisAgent(BaseFinancialAgent):
    """Agent responsible for market analysis and insights"""
    
    def __init__(self):
        super().__init__()
        self.market_data_service = MarketDataService()
    
    async def analyze_market(self, query: str) -> str:
        """Analyze market conditions and provide insights"""
        try:
            # Get market summary
            market_summary = await self.market_data_service.get_market_summary()
            
            if "error" in market_summary:
                return f"Error analyzing market conditions: {market_summary['error']}"
            
            # Extract data from both sources
            alpha_data = market_summary["sources"]["alpha_vantage"]
            yahoo_data = market_summary["sources"]["yahoo_finance"]
            
            # Generate analysis
            analysis = []
            
            # Add S&P 500 analysis
            if "SPY" in alpha_data:
                spy_data = alpha_data["SPY"]
                analysis.append(f"Current S&P 500 (SPY) Price: ${spy_data['price']:.2f}")
                analysis.append(f"Daily Change: ${spy_data['change']:.2f} ({spy_data['change_percent']:.2f}%)")
            
            # Add market sentiment
            analysis.append(f"\nMarket Sentiment: {market_summary['market_sentiment']}")
            
            # Add volume analysis
            if "SPY" in alpha_data:
                volume = alpha_data["SPY"]["volume"]
                analysis.append(f"\nTrading Volume: {volume:,}")
            
            # Add timestamp
            analysis.append(f"\nData as of: {market_summary['timestamp']}")
            
            return "\n".join(analysis)
            
        except Exception as e:
            logger.error(f"Error in market analysis: {str(e)}")
            return f"Error analyzing market conditions: {str(e)}"
    
    async def process_message(self, message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Process a message and return a response"""
        return await self.analyze_market(message) 