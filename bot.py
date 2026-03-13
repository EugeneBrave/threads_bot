import logging
from telegram import Bot
from telegram.constants import ParseMode
from telegram.error import TelegramError
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

logger = logging.getLogger(__name__)

async def send_daily_digest(posts: list):
    """
    Format posts into a digest and send to the specified Telegram Chat ID.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.error("Telegram credentials are not configured.")
        return False

    if not posts:
        logger.info("No posts to send today.")
        return False

    bot = Bot(token=TELEGRAM_BOT_TOKEN)
    
    # Format message
    message_text = "🧵 *Threads Daily Digest* 🧵\n\n"
    message_text += "Here are today's top posts for your keywords:\n\n"
    
    for idx, post in enumerate(posts, start=1):
        # Extract relevant fields. Adjust according to the actual Threads API response schema
        text_preview = post.get("text", "")[:100] + "..." if post.get("text") else "No text"
        post_link = post.get("permalink") or f"https://www.threads.net/t/{post.get('id')}"
        
        message_text += f"{idx}. {text_preview}\n"
        message_text += f"🔗 [Read Post]({post_link})\n\n"

    try:
        await bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=message_text,
            parse_mode=ParseMode.MARKDOWN,
            disable_web_page_preview=True
        )
        logger.info("Successfully sent daily digest to Telegram.")
        return True
    except TelegramError as e:
        logger.error(f"Failed to send Telegram message: {e}")
        return False
