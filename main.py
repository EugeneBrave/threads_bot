import time
import json
import os
import schedule
import logging
import asyncio
import sys
from datetime import datetime
from scraper import get_top_daily_posts
from ai_processor import generate_digest
from bot import send_daily_digest

# Fix for "Event loop is closed" RuntimeError on Windows specifically for asyncio + Playwright
if sys.platform.startswith('win'):
    from functools import wraps
    from asyncio.proactor_events import _ProactorBasePipeTransport

    def silence_event_loop_closed(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            try:
                return func(self, *args, **kwargs)
            except RuntimeError as e:
                if str(e) != 'Event loop is closed':
                    raise
        return wrapper

    _ProactorBasePipeTransport.__del__ = silence_event_loop_closed(_ProactorBasePipeTransport.__del__)
# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("bot.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

async def async_job():
    """
    The daily job that fetches posts and sends them via Telegram.
    """
    logger.info("Starting the daily Threads scraper job...")
    
    # 0. Get existing permalinks to avoid duplicates
    exclude_urls = get_existing_permalinks()
    logger.info(f"Loaded {len(exclude_urls)} existing permalinks to exclude.")
    
    # 1. Fetch top posts using async Playwright
    posts = await get_top_daily_posts(exclude_permalinks=exclude_urls)
    
    if not posts:
        logger.info("No new posts found today. Skipping Telegram message.")
        return
    
    logger.info(f"Found {len(posts)} new posts. Passing to AI Processor...")
    
    # 2. Process posts using AI (Gemini / Claude)
    # ai_summary is now a dict
    ai_summary = await generate_digest(posts)
    
    # 3. Save posts to JSON for the web viewer
    save_posts_to_json(posts, ai_summary)
    
    # 4. Format for Telegram and send
    telegram_text = format_summary_for_telegram(ai_summary)
    try:
        success = await send_daily_digest(telegram_text)
    except Exception as e:
        logger.error(f"Error running the async Telegram function: {e}")
        success = False
        
    if success:
        logger.info("Daily job completed successfully.")
    else:
        logger.error("Daily job finished with errors - message not sent.")

def get_existing_permalinks() -> list[str]:
    """Extract all permalinks from existing web/public/data/posts.json."""
    json_path = os.path.join(os.path.dirname(__file__), "web", "public", "data", "posts.json")
    if not os.path.exists(json_path):
        return []
    
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            permalinks = []
            for date_data in data.values():
                for post in date_data.get("posts", []):
                    if isinstance(post, dict) and "permalink" in post:
                        permalinks.append(post["permalink"])
            return permalinks
    except Exception as e:
        logger.warning(f"Failed to extract existing permalinks: {e}")
        return []

def format_summary_for_telegram(summary: dict) -> str:
    """Convert the structured JSON summary back to a markdown string for Telegram."""
    # Use simple bold for the main title
    text = f"*{summary.get('title', '今日 Threads 穿搭熱門追蹤')}*\n\n"
    text += f"{summary.get('intro', '')}\n\n"
    text += "---\n"
    text += "【精華貼文精選】\n\n"
    
    for item in summary.get('highlights', []):
        title = item.get('title', '').strip()
        desc = item.get('description', '').strip()
        url = item.get('url', '').strip()
        
        # Avoid nested stars, use emoji as bullet
        text += f"📍 {title}\n"
        if desc:
            text += f"{desc}\n"
        # Ensure the link is on its own line if it's long, or just ensure no trailing spaces
        text += f"[點我觀看原文]({url})\n\n"
    
    return text.strip()

def save_posts_to_json(posts: list, ai_summary: dict):
    """Save scraped posts and AI summary to web/public/data/posts.json"""
    from config import KEYWORDS
    
    json_path = os.path.join(os.path.dirname(__file__), "web", "public", "data", "posts.json")
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    # Load existing data if available
    existing_data = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError):
            existing_data = {}
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing_data[today] = {
        "keyword_tags": KEYWORDS,
        "ai_summary": ai_summary,
        "posts": posts
    }
    
    # Only keep the latest 5 days of data
    MAX_DAYS = 5
    if len(existing_data) > MAX_DAYS:
        sorted_dates = sorted(existing_data.keys(), reverse=True)
        existing_data = {d: existing_data[d] for d in sorted_dates[:MAX_DAYS]}
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Saved {len(posts)} posts to {json_path} (keeping {len(existing_data)} days)")

def job():
    """Wrapper to run async job from sync schedule"""
    asyncio.run(async_job())

def main():
    # If the --now flag is passed, run the job immediately and exit
    if len(sys.argv) > 1 and sys.argv[1] == "--now":
        logger.info("Running job immediately (--now flag detected).")
        job()
        return

    logger.info("Threads Bot is starting up...")
    
    # Schedule the job to run every day at a specific time (e.g., 09:00 AM)
    # You can change the time here
    schedule_time = "09:00"
    schedule.every().day.at(schedule_time).do(job)
    
    logger.info(f"Job scheduled to run daily at {schedule_time}.")

    # Keep the script running to execute scheduled tasks
    try:
        while True:
            schedule.run_pending()
            time.sleep(60) # check every minute
    except KeyboardInterrupt:
        logger.info("Bot stopped by user.")

if __name__ == "__main__":
    main()
