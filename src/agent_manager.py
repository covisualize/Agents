"""
Agent Manager

This module provides functionality to manage multiple agents,
including lifecycle management, coordination, and monitoring.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from src.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class AgentManager:
    """
    Manages multiple agents and their interactions.
    
    The AgentManager provides centralized control over agent lifecycle,
    task distribution, and monitoring.
    """
    
    def __init__(self, name: str = "AgentManager"):
        """
        Initialize the Agent Manager.
        
        Args:
            name: Name of the manager instance
        """
        self.name = name
        self.agents: Dict[str, BaseAgent] = {}
        self.is_running = False
        self.task_queue = asyncio.Queue()
        self.results = {}
        
        logger.info(f"Initialized AgentManager: {self.name}")
    
    def register_agent(self, agent: BaseAgent) -> bool:
        """
        Register an agent with the manager.
        
        Args:
            agent: The agent to register
            
        Returns:
            True if successful, False if agent name already exists
        """
        if agent.name in self.agents:
            logger.warning(f"Agent {agent.name} already registered")
            return False
        
        self.agents[agent.name] = agent
        logger.info(f"Registered agent: {agent.name}")
        return True
    
    def unregister_agent(self, agent_name: str) -> bool:
        """
        Unregister an agent from the manager.
        
        Args:
            agent_name: Name of the agent to unregister
            
        Returns:
            True if successful, False if agent not found
        """
        if agent_name not in self.agents:
            logger.warning(f"Agent {agent_name} not found")
            return False
        
        # Stop the agent if it's running
        agent = self.agents[agent_name]
        if agent.is_active:
            agent.stop()
        
        del self.agents[agent_name]
        logger.info(f"Unregistered agent: {agent_name}")
        return True
    
    def start_agent(self, agent_name: str) -> bool:
        """
        Start a specific agent.
        
        Args:
            agent_name: Name of the agent to start
            
        Returns:
            True if successful, False if agent not found
        """
        if agent_name not in self.agents:
            logger.error(f"Agent {agent_name} not found")
            return False
        
        self.agents[agent_name].start()
        return True
    
    def stop_agent(self, agent_name: str) -> bool:
        """
        Stop a specific agent.
        
        Args:
            agent_name: Name of the agent to stop
            
        Returns:
            True if successful, False if agent not found
        """
        if agent_name not in self.agents:
            logger.error(f"Agent {agent_name} not found")
            return False
        
        self.agents[agent_name].stop()
        return True
    
    def start_all_agents(self):
        """Start all registered agents."""
        for agent in self.agents.values():
            agent.start()
        logger.info("Started all agents")
    
    def stop_all_agents(self):
        """Stop all registered agents."""
        for agent in self.agents.values():
            agent.stop()
        logger.info("Stopped all agents")
    
    async def process_with_agent(self, agent_name: str, input_data: Any) -> Any:
        """
        Process data with a specific agent.
        
        Args:
            agent_name: Name of the agent to use
            input_data: Data to process
            
        Returns:
            Processed result
            
        Raises:
            KeyError: If agent not found
            RuntimeError: If agent is not active
        """
        if agent_name not in self.agents:
            raise KeyError(f"Agent {agent_name} not found")
        
        agent = self.agents[agent_name]
        if not agent.is_active:
            raise RuntimeError(f"Agent {agent_name} is not active")
        
        return await agent.process(input_data)
    
    async def process_with_all_agents(self, input_data: Any) -> Dict[str, Any]:
        """
        Process data with all active agents.
        
        Args:
            input_data: Data to process
            
        Returns:
            Dictionary mapping agent names to their results
        """
        tasks = []
        active_agents = []
        
        for agent_name, agent in self.agents.items():
            if agent.is_active:
                tasks.append(agent.process(input_data))
                active_agents.append(agent_name)
        
        if not tasks:
            logger.warning("No active agents found")
            return {}
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            agent_name: result 
            for agent_name, result in zip(active_agents, results)
        }
    
    def get_agent_status(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a specific agent.
        
        Args:
            agent_name: Name of the agent
            
        Returns:
            Agent status dictionary or None if not found
        """
        if agent_name not in self.agents:
            return None
        
        return self.agents[agent_name].get_status()
    
    def get_all_agent_status(self) -> Dict[str, Dict[str, Any]]:
        """
        Get status of all agents.
        
        Returns:
            Dictionary mapping agent names to their status
        """
        return {
            name: agent.get_status() 
            for name, agent in self.agents.items()
        }
    
    def get_active_agents(self) -> List[str]:
        """
        Get list of active agent names.
        
        Returns:
            List of active agent names
        """
        return [
            name for name, agent in self.agents.items() 
            if agent.is_active
        ]
    
    def get_manager_status(self) -> Dict[str, Any]:
        """
        Get overall manager status.
        
        Returns:
            Manager status dictionary
        """
        return {
            "name": self.name,
            "total_agents": len(self.agents),
            "active_agents": len(self.get_active_agents()),
            "running": self.is_running,
            "agent_names": list(self.agents.keys())
        }