"""
Coordinator Agent for orchestrating the financial advisor system
"""

from typing import Dict, List, Any, Union
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
import asyncio
import json
import logging

from .base_agent import BaseFinancialAgent
from .market_analysis_agent import MarketAnalysisAgent
from .risk_assessment_agent import RiskAssessmentAgent
from .portfolio_agent import PortfolioAgent

class CoordinatorAgent(BaseFinancialAgent):
    """Agent responsible for coordinating between different specialized agents"""
    
    def __init__(self, llm: ChatOpenAI = None):
        # Initialize specialized agents
        self.market_agent = MarketAnalysisAgent()
        self.risk_agent = RiskAssessmentAgent()
        self.portfolio_agent = PortfolioAgent()
        
        # Initialize tools with proper async handling
        tools = [
            Tool(
                name="analyze_market",
                func=self._run_market_analysis,
                description="Analyze current market conditions and trends"
            ),
            Tool(
                name="assess_risk",
                func=self._run_risk_assessment,
                description="Assess investment risk based on user profile and market conditions"
            ),
            Tool(
                name="generate_portfolio",
                func=self._run_portfolio_generation,
                description="Generate investment portfolio recommendations"
            )
        ]
        
        # Define system prompt
        system_prompt = """You are a financial advisor coordinator that helps users make investment decisions.
        You have access to specialized agents for market analysis, risk assessment, and portfolio management.
        Use these tools to provide comprehensive investment advice.
        
        When analyzing a request:
        1. First analyze the market conditions
        2. Then assess the user's risk profile
        3. Finally, generate a suitable portfolio recommendation
        
        Always explain your reasoning and provide clear, actionable advice."""
        
        # Initialize base class
        super().__init__(llm=llm, tools=tools, system_prompt=system_prompt)
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create agent
        self.agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Create agent executor
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True
        )
        
        # Set up detailed logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)
    
    def _run_market_analysis(self, query: str) -> str:
        """Run market analysis with proper error handling"""
        self.logger.debug(f"Starting market analysis with query: {query}")
        try:
            result = asyncio.run(self.market_agent.analyze_market(query))
            self.logger.debug(f"Market analysis result: {result}")
            return result
        except Exception as e:
            self.logger.error(f"Error in market analysis: {str(e)}", exc_info=True)
            return f"Error analyzing market conditions: {str(e)}"
    
    def _run_risk_assessment(self, profile: str) -> str:
        """Run risk assessment with proper error handling"""
        self.logger.debug(f"Starting risk assessment with profile: {profile}")
        try:
            result = asyncio.run(self.risk_agent.assess_risk(profile))
            self.logger.debug(f"Risk assessment result: {result}")
            return result
        except Exception as e:
            self.logger.error(f"Error in risk assessment: {str(e)}", exc_info=True)
            return f"Error assessing risk: {str(e)}"
    
    def _run_portfolio_generation(self, profile: str) -> str:
        """Run portfolio generation with proper error handling"""
        self.logger.debug(f"Starting portfolio generation with profile: {profile}")
        try:
            result = self.portfolio_agent.generate_portfolio(profile)
            self.logger.debug(f"Portfolio generation result: {result}")
            return result
        except Exception as e:
            self.logger.error(f"Error in portfolio generation: {str(e)}", exc_info=True)
            return f"Error generating portfolio: {str(e)}"
    
    def _extract_response_content(self, response: Any) -> str:
        """Extract content from various response types"""
        self.logger.debug(f"Extracting content from response type: {type(response)}")
        try:
            if isinstance(response, str):
                self.logger.debug("Response is a string")
                return response
            elif isinstance(response, dict):
                self.logger.debug(f"Response is a dictionary with keys: {list(response.keys())}")
                # Try to get output from different possible keys
                for key in ['output', 'response', 'content', 'text', 'result']:
                    if key in response:
                        self.logger.debug(f"Found content in key: {key}")
                        return str(response[key])
                # If no known keys found, convert dict to string
                self.logger.debug("No known keys found, converting dict to string")
                return json.dumps(response, indent=2)
            elif hasattr(response, 'content'):
                self.logger.debug("Response has content attribute")
                return str(response.content)
            elif hasattr(response, 'output'):
                self.logger.debug("Response has output attribute")
                return str(response.output)
            else:
                self.logger.debug(f"Response is of type {type(response)}, converting to string")
                return str(response)
        except Exception as e:
            self.logger.error(f"Error extracting response content: {str(e)}", exc_info=True)
            return str(response)
    
    async def process_message(self, message: str, chat_history: Union[List[Dict[str, str]], str, None] = None) -> str:
        """Process a user message and return a response"""
        self.logger.debug(f"Processing message: {message}")
        self.logger.debug(f"Chat history type: {type(chat_history)}, value: {chat_history}")
        
        try:
            # Convert chat history to LangChain message format
            lc_chat_history = []
            
            # Handle different chat history formats
            if chat_history is not None:
                if isinstance(chat_history, str):
                    self.logger.debug("Chat history is a string (likely a session ID), initializing empty history")
                    lc_chat_history = []
                elif isinstance(chat_history, list):
                    self.logger.debug(f"Processing chat history list with {len(chat_history)} messages")
                    for msg in chat_history:
                        if isinstance(msg, dict) and "role" in msg and "content" in msg:
                            if msg["role"] == "user":
                                lc_chat_history.append(HumanMessage(content=msg["content"]))
                            else:
                                lc_chat_history.append(AIMessage(content=msg["content"]))
                        else:
                            self.logger.warning(f"Skipping invalid message format: {msg}")
                else:
                    self.logger.warning(f"Unexpected chat history type: {type(chat_history)}")
            
            self.logger.debug(f"Converted chat history to LangChain format: {lc_chat_history}")
            
            # Process message
            self.logger.debug("Invoking agent executor")
            response = await self.agent_executor.ainvoke({
                "input": message,
                "chat_history": lc_chat_history
            })
            
            self.logger.debug(f"Agent executor response type: {type(response)}")
            self.logger.debug(f"Agent executor response: {response}")
            
            # Extract and return response content
            result = self._extract_response_content(response)
            self.logger.debug(f"Final extracted response: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return f"I apologize, but I encountered an error while processing your request: {str(e)}" 