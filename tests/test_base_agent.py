"""
Test cases for the BaseAgent class.
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from base_agent import BaseAgent


class TestAgent(BaseAgent):
    """Test implementation of BaseAgent for testing."""
    
    async def process(self, input_data):
        """Simple test processing."""
        return f"processed: {input_data}"


class TestBaseAgent:
    """Test cases for BaseAgent functionality."""
    
    def test_initialization(self):
        """Test agent initialization."""
        agent = TestAgent("TestAgent")
        
        assert agent.name == "TestAgent"
        assert agent.config == {}
        assert agent.is_active == False
        assert agent.history == []
    
    def test_initialization_with_config(self):
        """Test agent initialization with configuration."""
        config = {"setting1": "value1", "setting2": 42}
        agent = TestAgent("TestAgent", config)
        
        assert agent.name == "TestAgent"
        assert agent.config == config
        assert agent.is_active == False
    
    def test_start_stop(self):
        """Test agent start and stop functionality."""
        agent = TestAgent("TestAgent")
        
        # Initially not active
        assert agent.is_active == False
        
        # Start agent
        agent.start()
        assert agent.is_active == True
        
        # Stop agent
        agent.stop()
        assert agent.is_active == False
    
    @pytest.mark.asyncio
    async def test_process(self):
        """Test the process method."""
        agent = TestAgent("TestAgent")
        
        result = await agent.process("test input")
        assert result == "processed: test input"
    
    def test_get_status(self):
        """Test status reporting."""
        config = {"test": "config"}
        agent = TestAgent("TestAgent", config)
        
        status = agent.get_status()
        expected = {
            "name": "TestAgent",
            "active": False,
            "config": config,
            "history_length": 0
        }
        
        assert status == expected
        
        # Start agent and check status again
        agent.start()
        status = agent.get_status()
        assert status["active"] == True
    
    def test_history_management(self):
        """Test history functionality."""
        agent = TestAgent("TestAgent")
        
        # Initially empty
        assert len(agent.history) == 0
        
        # Add entries
        agent.add_to_history({"action": "test1"})
        agent.add_to_history({"action": "test2"})
        
        assert len(agent.history) == 2
        assert agent.history[0]["action"] == "test1"
        assert agent.history[1]["action"] == "test2"
        
        # Clear history
        agent.clear_history()
        assert len(agent.history) == 0
    
    def test_history_size_limit(self):
        """Test that history size is limited."""
        agent = TestAgent("TestAgent")
        
        # Add more than 1000 entries
        for i in range(1200):
            agent.add_to_history({"entry": i})
        
        # Should be limited to 500 most recent
        assert len(agent.history) == 500
        assert agent.history[0]["entry"] == 700  # 1200 - 500 = 700
        assert agent.history[-1]["entry"] == 1199
    
    def test_save_load_config(self, tmp_path):
        """Test configuration save and load."""
        config = {"setting1": "value1", "setting2": 42}
        agent = TestAgent("OriginalAgent", config)
        
        # Save config
        config_file = tmp_path / "test_config.json"
        agent.save_config(str(config_file))
        
        # Load config
        loaded_agent = TestAgent.load_config(str(config_file))
        
        assert loaded_agent.name == "OriginalAgent"
        assert loaded_agent.config == config


if __name__ == "__main__":
    pytest.main([__file__])