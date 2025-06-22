class AgentError(Exception):
    """Base exception for agent-related errors."""
    pass

class LLMError(AgentError):
    """Exception raised for LLM-related errors."""
    pass

class CacheError(Exception):
    """Exception raised for cache-related errors."""
    pass

class ValidationError(Exception):
    """Exception raised for input validation errors."""
    pass 