import os
from dotenv import load_dotenv
import google.generativeai as genai

# Step 1: Load Environment Variables (API Key)
load_dotenv()  # Load variables from .env file
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY")  # Ensure API key is loaded

# Step 2: Configure the Gemini Client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Step 3: Define the Model
model = genai.GenerativeModel(model_name='gemini-2.0-flash-exp')

# Step 4: Define LLM Configuration
prompt = "How does AI work?"  # Your prompt for content generation

# Step 5: Generate Content Using Gemini
try:
    response = model.generate_content(prompt)

    # Step 6: Print the Response Text
    print("Response from Gemini:")
    print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")
