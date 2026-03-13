import os
from dotenv import load_dotenv

# Load environment variables from .env file
# Threads API Configuration
THREADS_ACCESS_TOKEN = os.getenv("THREADS_ACCESS_TOKEN")
THREADS_API_BASE_URL = "https://graph.threads.net/v1.0"

# Load environment variables
load_dotenv()

# Telegram details
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# AI API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# App configuration
KEYWORDS = ["男生穿搭", "美式復古", "阿美咔嘰"]
POSTS_PER_KEYWORD = 5
