import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Threads API Configuration
THREADS_ACCESS_TOKEN = os.getenv("THREADS_ACCESS_TOKEN")
THREADS_API_BASE_URL = "https://graph.threads.net/v1.0"

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Search Configuration
KEYWORDS = ["男生穿搭", "美式復古", "阿美咔嘰"]
POSTS_PER_DAY = 10
