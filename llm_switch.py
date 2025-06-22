import os
from openai import OpenAI
import google.generativeai as genai
from typing import Literal, Union
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMClient:
    def __init__(self):
        # Load API keys from environment variables
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # Initialize clients
        self.openai_client = OpenAI(api_key=self.openai_api_key)
        genai.configure(api_key=self.gemini_api_key)
        
        # Available models
        self.models = {
            "gpt-4": {"provider": "openai", "name": "gpt-4"},
            "gpt-3.5-turbo": {"provider": "openai", "name": "gpt-3.5-turbo"},
            "gemini-pro": {"provider": "gemini", "name": "gemini-pro"},
        }

    def generate_response(
        self,
        prompt: str,
        model: Literal["gpt-4", "gpt-3.5-turbo", "gemini-pro"] = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Union[str, None]:
        """
        Generate a response using the specified LLM model.
        
        Args:
            prompt (str): The input prompt for the model
            model (str): The model to use (gpt-4, gpt-3.5-turbo, or gemini-pro)
            temperature (float): Controls randomness in the output (0.0 to 1.0)
            max_tokens (int): Maximum number of tokens in the response
            
        Returns:
            str: The generated response
        """
        try:
            if model not in self.models:
                raise ValueError(f"Model {model} not supported. Available models: {list(self.models.keys())}")

            provider = self.models[model]["provider"]
            
            if provider == "openai":
                response = self.openai_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
                
            elif provider == "gemini":
                model_instance = genai.GenerativeModel(self.models[model]["name"])
                response = model_instance.generate_content(prompt)
                return response.text
                
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return None

def main():
    # Initialize the LLM client
    llm_client = LLMClient()
    
    # Example prompts for testing
    test_prompts = [
        "What is artificial intelligence?",
        "Explain how neural networks work.",
        "What are the applications of machine learning?"
    ]
    
    # Test with different models
    models = ["gpt-3.5-turbo", "gemini-pro", "gpt-4"]
    
    for prompt in test_prompts:
        print(f"\nPrompt: {prompt}")
        print("-" * 50)
        
        for model in models:
            print(f"\nUsing {model}:")
            response = llm_client.generate_response(prompt, model=model)
            if response:
                print(f"Response: {response}\n")
            else:
                print(f"Failed to generate response with {model}")

if __name__ == "__main__":
    main() 