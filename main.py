import time
import schedule
import logging
import asyncio
import sys
from scraper import get_top_daily_posts
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
    
    # 1. Fetch top posts using async Playwright
    posts = await get_top_daily_posts()
    
    if not posts:
        logger.info("No posts found today. Skipping Telegram message.")
        return

    logger.info(f"Found {len(posts)} posts to send.")
    
    # 2. Send via Telegram
    try:
        success = await send_daily_digest(posts)
    except Exception as e:
        logger.error(f"Error running the async Telegram function: {e}")
        success = False
        
    if success:
        logger.info("Daily job completed successfully.")
    else:
        logger.error("Daily job finished with errors - message not sent.")

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
