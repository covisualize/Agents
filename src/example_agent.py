"""
Example Agent Implementation

This module demonstrates how to create a simple agent using the BaseAgent class.
"""

import asyncio
from typing import Any, Dict
from src.base_agent import BaseAgent


class ExampleAgent(BaseAgent):
    """
    A simple example agent that processes text input.
    
    This agent demonstrates basic functionality like text processing,
    logging, and state management.
    """
    
    def __init__(self, name: str = "ExampleAgent", config: Dict[str, Any] = None):
        """
        Initialize the Example Agent.
        
        Args:
            name: Name of the agent (default: "ExampleAgent")
            config: Configuration dictionary
        """
        default_config = {
            "processing_delay": 0.1,  # Simulated processing delay
            "max_length": 1000,       # Maximum input length
            "prefix": "Processed: "   # Prefix for output
        }
        
        # Merge with provided config
        if config:
            default_config.update(config)
        
        super().__init__(name, default_config)
    
    async def process(self, input_data: Any) -> str:
        """
        Process the input data.
        
        Args:
            input_data: Input to process (will be converted to string)
            
        Returns:
            Processed string with prefix
        """
        if not self.is_active:
            raise RuntimeError(f"Agent {self.name} is not active")
        
        # Convert input to string
        text_input = str(input_data)
        
        # Check length limit
        max_length = self.config.get("max_length", 1000)
        if len(text_input) > max_length:
            text_input = text_input[:max_length] + "..."
        
        # Simulate processing delay
        delay = self.config.get("processing_delay", 0.1)
        await asyncio.sleep(delay)
        
        # Add prefix
        prefix = self.config.get("prefix", "Processed: ")
        result = f"{prefix}{text_input}"
        
        # Log the processing
        self.add_to_history({
            "input": text_input,
            "output": result,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return result


# Example usage
async def main():
    """Example usage of the ExampleAgent."""
    
    # Create and configure the agent
    agent = ExampleAgent("MyTextProcessor", {
        "processing_delay": 0.05,
        "prefix": "✓ "
    })
    
    # Start the agent
    agent.start()
    
    try:
        # Process some inputs
        inputs = [
            "Hello, world!",
            "This is a test message",
            42,  # Will be converted to string
            {"data": "complex object"}  # Will be converted to string
        ]
        
        for input_data in inputs:
            result = await agent.process(input_data)
            print(f"Input: {input_data}")
            print(f"Output: {result}")
            print("-" * 40)
        
        # Show agent status
        status = agent.get_status()
        print(f"Agent Status: {status}")
        
    finally:
        # Always stop the agent
        agent.stop()


if __name__ == "__main__":
    asyncio.run(main())