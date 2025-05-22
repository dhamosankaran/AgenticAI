"""
Base class for all financial advisor agents
"""

import logging
from typing import Dict, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.tools import Tool

class BaseFinancialAgent:
    """Base class for all financial advisor agents"""
    
    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        tools: Optional[List[Tool]] = None,
        system_prompt: Optional[str] = None
    ):
        """Initialize the base agent"""
        self.logger = logging.getLogger(self.__class__.__name__)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7
        )
        self.tools = tools or []
        self.system_prompt = system_prompt
    
    async def process_message(self, message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Process a message and return a response"""
        raise NotImplementedError("Subclasses must implement process_message") 