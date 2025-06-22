from typing import Dict, List, Optional, Union
from datetime import datetime
import logging

from crewai import Crew, Task
from .base_agent import BaseAgent
from .market_analyst import MarketAnalyst
from .consumer_analyst import ConsumerAnalyst
from .industry_analyst import IndustryAnalyst
from .exceptions import AgentError, LLMError
from .cache import Cache
from textwrap import dedent
from functools import lru_cache

logger = logging.getLogger(__name__)

class ResearchManager(BaseAgent):
    """Research manager agent responsible for coordinating and synthesizing research."""
    
    def __init__(self):
        super().__init__(
            role="Research Manager",
            goal="Coordinate and synthesize research findings into actionable insights",
            backstory="""You are a strategic research manager skilled at synthesizing diverse 
            insights into cohesive recommendations. You excel at identifying key patterns and 
            opportunities across market, consumer, and industry analyses."""
        )
        self.cache = Cache()
        self.market_analyst = MarketAnalyst()
        self.consumer_analyst = ConsumerAnalyst()
        self.industry_analyst = IndustryAnalyst()

    @lru_cache(maxsize=100)
    def get_cached_analysis(self, product_name: str, context: str = "") -> Optional[Dict]:
        """Get cached analysis results if available."""
        return self.cache.get(f"{product_name}:{context}")

    def analyze_task(self, product_name: str, context: str = "") -> str:
        """Synthesize research findings and provide strategic recommendations."""
        try:
            # Check cache first
            cached_results = self.get_cached_analysis(product_name, context)
            if cached_results:
                logger.info("Found cached results")
                return self.format_output(str(cached_results))

            # Run individual analyst tasks first
            market_task = Task(
                description=f"""Analyze market opportunities for {product_name}.\n\nContext: {context}""",
                agent=self.market_analyst.create_agent(),
                expected_output="Market analysis with size, trends, and competition insights."
            )
            consumer_task = Task(
                description=f"""Analyze consumer behavior for {product_name}.\n\nContext: {context}""",
                agent=self.consumer_analyst.create_agent(),
                expected_output="Consumer analysis with demographics and behavior patterns."
            )
            industry_task = Task(
                description=f"""Analyze industry landscape for {product_name}.\n\nContext: {context}""",
                agent=self.industry_analyst.create_agent(),
                expected_output="Industry analysis with regulatory and technological insights."
            )

            # Run each analysis separately to ensure proper result handling
            market_crew = Crew(agents=[self.market_analyst.create_agent()], tasks=[market_task], verbose=True)
            consumer_crew = Crew(agents=[self.consumer_analyst.create_agent()], tasks=[consumer_task], verbose=True)
            industry_crew = Crew(agents=[self.industry_analyst.create_agent()], tasks=[industry_task], verbose=True)

            market_result = market_crew.kickoff()
            consumer_result = consumer_crew.kickoff()
            industry_result = industry_crew.kickoff()

            # Synthesize results
            synthesis_task = Task(
                description=f"""
                Synthesize the following research findings for {product_name} into strategic recommendations:
                
                Market Analysis:
                {market_result}
                
                Consumer Analysis:
                {consumer_result}
                
                Industry Analysis:
                {industry_result}
                
                If provided, consider this additional context: {context}
                
                Focus on:
                1. Key insights synthesis
                2. Strategic opportunities
                3. Risk assessment
                4. Implementation considerations
                5. Success metrics
                
                Format your response with clear sections and bullet points.
                Conclude with prioritized action items.
                """,
                agent=self.create_agent(),
                expected_output="A strategic synthesis of market research findings with actionable recommendations and implementation plan."
            )

            # Run synthesis
            synthesis_crew = Crew(agents=[self.create_agent()], tasks=[synthesis_task], verbose=True)
            final_result = synthesis_crew.kickoff()

            # Format the complete response
            response = {
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'version': '2.0',
                    'status': 'success'
                },
                'results': {
                    'manager': self.format_output(str(final_result)),
                    'market': self.format_output(str(market_result)),
                    'consumer': self.format_output(str(consumer_result)),
                    'industry': self.format_output(str(industry_result))
                },
                'errors': {}
            }

            # Cache the results
            self.cache.set(f"{product_name}:{context}", response)

            # Return the response directly without additional formatting
            return response
            
        except Exception as e:
            logger.error(f"Error in research synthesis: {str(e)}")
            # Return error in standardized format
            return self.format_output(f"Error: {str(e)}")