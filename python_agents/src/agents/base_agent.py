from crewai import Agent, LLM, Task, Crew
from textwrap import dedent
import os
import logging
import re
import json
from .exceptions import LLMError
from crewai_tools import SerperDevTool
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


logger = logging.getLogger(__name__)

class BaseAgent:
    """Base class for all agents to eliminate code duplication."""
    
    def __init__(self, role: str, goal: str, backstory: str):
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self._agent = None
        self._llm = None
        self._tools = []

    def create_llm(self) -> LLM:
        """Create and configure LLM instance."""
        if not self._llm:
              retry_strategy = Retry(
                total=3,
                status_forcelist=[429, 500, 502, 503, 504],
                backoff_factor=0.5,
                connect=3,
                read=3,
            )
              adapter = HTTPAdapter(max_retries=retry_strategy)
              http = requests.Session()
              http.mount("https://", adapter)
              http.mount("http://", adapter)
              self._llm = LLM(
                    model="gemini/gemini-2.0-flash-exp",
                    temperature=0.7,
                    max_tokens=1200,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0,
                    verbose=True,
                    http_client=http,
                    api_key=os.getenv("GEMINI_API_KEY")
                )
              if not self._llm.api_key:
                    raise LLMError("GEMINI_API_KEY is not set or invalid")
        return self._llm
    
    def create_tools(self):
        """Create and configure tools for the agent"""
        if not self._tools:
            serper_api_key = os.getenv("SERPER_API_KEY")
            if not serper_api_key:
               raise Exception("SERPER_API_KEY not set")
            self._tools = [
                SerperDevTool(api_key=serper_api_key)
            ]
          
        return self._tools


    def create_agent(self) -> Agent:
        """Create agent with common configuration."""
        if self._agent:
            logger.info(f"Returning existing {self.role} agent instance")
            return self._agent
            
        logger.info(f"Creating {self.role} agent")
        
        try:
            llm = self.create_llm()
            tools = self.create_tools()
            self._agent = Agent(
                role=self.role,
                goal=self.goal,
                backstory=dedent(self.backstory),
                tools=tools,
                verbose=True,
                allow_delegation=False,
                memory=True,
                llm=llm
            )
            logger.info(f"{self.role} agent created successfully")
            return self._agent
        except Exception as e:
            logger.error(f"Error creating {self.role} agent: {str(e)}")
            raise

    def format_output(self, content: str) -> str:
        """Format the output content."""
        return content.strip()

    def format_structured_output(self, content: str, charts: list = None, tables: list = None) -> dict:
        """Format output with optional structured data for charts and tables.
        
        Args:
            content (str): The markdown content
            charts (list): List of chart objects with format:
                {
                    'type': 'bar|line|pie',
                    'title': 'Chart title',
                    'data': {
                        'labels': [...],
                        'datasets': [{
                            'label': 'Dataset label',
                            'data': [...]
                        }]
                    }
                }
            tables (list): List of table objects with format:
                {
                    'title': 'Table title',
                    'headers': [...],
                    'rows': [{...}, ...]
                }
        """
        return {
            'content': content.strip(),
            'charts': charts or [],
            'tables': tables or []
        }

    def analyze_task(self, product_name: str, context: str) -> str:
        """Base method for analysis task - should be overridden by subclasses."""
        raise NotImplementedError("Subclasses must implement analyze_task method")