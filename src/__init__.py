"""
Agent Framework

A flexible framework for creating and managing AI agents.
"""

from .base_agent import BaseAgent
from .example_agent import ExampleAgent
from .agent_manager import AgentManager

__version__ = "0.1.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

__all__ = [
    "BaseAgent",
    "ExampleAgent", 
    "AgentManager"
]