import logging
from telegram import Bot
from telegram.constants import ParseMode
from telegram.error import TelegramError
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

logger = logging.getLogger(__name__)

async def send_daily_digest(message_text: str):
    """
    Send the AI-generated digest to the specified Telegram Chat ID.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.error("Telegram credentials are not configured.")
        return False

    if not message_text:
        logger.info("No message to send today.")
        return False

    bot = Bot(token=TELEGRAM_BOT_TOKEN)

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
