"""
Example: Basic Agent Usage

This example demonstrates how to create, configure, and use agents
with the basic functionality provided by the framework.
"""

import asyncio
import sys
import os

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from example_agent import ExampleAgent
from agent_manager import AgentManager


async def basic_agent_example():
    """Demonstrate basic agent usage."""
    print("=== Basic Agent Example ===")
    
    # Create a simple agent
    agent = ExampleAgent("BasicProcessor")
    
    # Start the agent
    agent.start()
    
    try:
        # Process some data
        inputs = [
            "Hello, Agent!",
            "Processing some data",
            {"message": "Complex data structure"},
            42
        ]
        
        for i, data in enumerate(inputs, 1):
            result = await agent.process(data)
            print(f"{i}. Input: {data}")
            print(f"   Output: {result}")
            print()
        
        # Show agent status
        status = agent.get_status()
        print(f"Agent Status: {status}")
        
    finally:
        agent.stop()
        print("Agent stopped.\n")


async def agent_manager_example():
    """Demonstrate agent manager usage."""
    print("=== Agent Manager Example ===")
    
    # Create a manager
    manager = AgentManager("ExampleManager")
    
    # Create and register multiple agents
    agent1 = ExampleAgent("Processor1", {"prefix": "🔧 "})
    agent2 = ExampleAgent("Processor2", {"prefix": "⚙️ "})
    agent3 = ExampleAgent("Processor3", {"prefix": "🛠️ "})
    
    manager.register_agent(agent1)
    manager.register_agent(agent2)
    manager.register_agent(agent3)
    
    # Start all agents
    manager.start_all_agents()
    
    try:
        # Process data with a specific agent
        result1 = await manager.process_with_agent("Processor1", "Test message")
        print(f"Processor1 result: {result1}")
        
        # Process data with all agents
        test_data = "Broadcast this message"
        results = await manager.process_with_all_agents(test_data)
        
        print(f"\nProcessing '{test_data}' with all agents:")
        for agent_name, result in results.items():
            print(f"  {agent_name}: {result}")
        
        # Show manager status
        print(f"\nManager status: {manager.get_manager_status()}")
        
        # Show individual agent statuses
        print("\nIndividual agent statuses:")
        for name, status in manager.get_all_agent_status().items():
            print(f"  {name}: Active={status['active']}, History={status['history_length']}")
        
    finally:
        manager.stop_all_agents()
        print("All agents stopped.\n")


async def custom_configuration_example():
    """Demonstrate custom agent configuration."""
    print("=== Custom Configuration Example ===")
    
    # Create agent with custom configuration
    custom_config = {
        "prefix": "🚀 CUSTOM: ",
        "processing_delay": 0.01,  # Very fast
        "max_length": 50           # Short messages
    }
    
    agent = ExampleAgent("CustomAgent", custom_config)
    agent.start()
    
    try:
        # Test with different input lengths
        inputs = [
            "Short message",
            "This is a longer message that should be truncated",
            "Very long message that definitely exceeds the max length limit and should be cut off"
        ]
        
        for data in inputs:
            result = await agent.process(data)
            print(f"Input ({len(data)} chars): {data}")
            print(f"Output: {result}")
            print()
        
    finally:
        agent.stop()


async def main():
    """Run all examples."""
    print("🤖 Agent Framework Examples\n")
    
    await basic_agent_example()
    await agent_manager_example()
    await custom_configuration_example()
    
    print("✅ All examples completed!")


if __name__ == "__main__":
    asyncio.run(main())