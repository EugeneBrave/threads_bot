import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Threads API Configuration
THREADS_ACCESS_TOKEN = os.getenv("THREADS_ACCESS_TOKEN")
THREADS_API_BASE_URL = "https://graph.threads.net/v1.0"

# Telegram details
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# AI API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# App configuration
KEYWORDS = [
    # 中文
    "男生穿搭",
    "美式復古",
    "工裝穿搭",
    "日系穿搭",
    "古著穿搭",
    # English
    "menswear",
    "amekaji",
    "cityboy",
    # 日本語
    "メンズファッション",
    "古着コーデ",
]
POSTS_PER_KEYWORD = 5
MAX_POST_AGE_DAYS = 30
