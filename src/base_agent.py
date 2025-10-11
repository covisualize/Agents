"""
Base Agent Class

This module provides the base class for all agents in the system.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all agents.
    
    This class provides the common interface and functionality
    that all agents should implement.
    """
    
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the agent.
        
        Args:
            name (str): The name of the agent
            config (dict, optional): Configuration parameters for the agent
        """
        self.name = name
        self.config = config or {}
        self.is_active = False
        self.history = []
        
        logger.info(f"Initialized agent: {self.name}")
    
    @abstractmethod
    async def process(self, input_data: Any) -> Any:
        """
        Process input data and return the result.
        
        Args:
            input_data: The data to process
            
        Returns:
            The processed result
        """
        pass
    
    def start(self):
        """Start the agent."""
        self.is_active = True
        logger.info(f"Agent {self.name} started")
    
    def stop(self):
        """Stop the agent."""
        self.is_active = False
        logger.info(f"Agent {self.name} stopped")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the agent.
        
        Returns:
            Dictionary containing agent status information
        """
        return {
            "name": self.name,
            "active": self.is_active,
            "config": self.config,
            "history_length": len(self.history)
        }
    
    def add_to_history(self, entry: Dict[str, Any]):
        """
        Add an entry to the agent's history.
        
        Args:
            entry: Dictionary containing the history entry
        """
        self.history.append(entry)
        
        # Keep history size manageable
        if len(self.history) > 1000:
            self.history = self.history[-500:]  # Keep last 500 entries
    
    def clear_history(self):
        """Clear the agent's history."""
        self.history.clear()
        logger.info(f"Cleared history for agent: {self.name}")
    
    def save_config(self, filepath: str):
        """
        Save the agent's configuration to a file.
        
        Args:
            filepath: Path to save the configuration
        """
        config_data = {
            "name": self.name,
            "config": self.config
        }
        
        with open(filepath, 'w') as f:
            json.dump(config_data, f, indent=2)
        
        logger.info(f"Saved config for {self.name} to {filepath}")
    
    @classmethod
    def load_config(cls, filepath: str) -> 'BaseAgent':
        """
        Load an agent configuration from a file.
        
        Args:
            filepath: Path to the configuration file
            
        Returns:
            Configured agent instance
        """
        with open(filepath, 'r') as f:
            config_data = json.load(f)
        
        return cls(config_data["name"], config_data["config"])