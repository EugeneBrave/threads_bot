import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No GEMINI_API_KEY found in .env")
else:
    try:
        client = genai.Client(api_key=api_key)
        print("Available Gemini models:")
        for m in client.models.list():
            if "gemini" in (m.name or "").lower():
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
