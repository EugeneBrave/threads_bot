import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No GEMINI_API_KEY found in .env")
else:
    try:
        genai.configure(api_key=api_key)
        models = [m.name for m in genai.list_models()]
        print("Available models:")
        for m in models:
            print("- " + m)
    except Exception as e:
        print(f"Error listing models: {e}")
