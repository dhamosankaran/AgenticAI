"""
Pytest configuration file
"""

import os
import sys
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

# Set environment variables for testing
os.environ["OPENAI_API_KEY"] = "test-key"
os.environ["ALPHA_VANTAGE_API_KEY"] = "test-key" 