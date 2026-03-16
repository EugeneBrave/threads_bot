import pytest
from unittest.mock import AsyncMock, patch
from bot import send_daily_digest
import telegram
from telegram.error import TimedOut

@pytest.fixture
def mock_bot(mocker):
    bot_mock = AsyncMock()
    mocker.patch('bot.Bot', return_value=bot_mock)
    return bot_mock

@pytest.mark.asyncio
async def test_send_daily_digest_success(mock_bot):
    message = "Test message"
    
    # Needs to be patched since the original bot module reads from env config
    with patch('bot.TELEGRAM_BOT_TOKEN', 'fake_token'), patch('bot.TELEGRAM_CHAT_ID', 'fake_id'):
        result = await send_daily_digest(message)
        
    assert result is True
    mock_bot.send_message.assert_called_once_with(
        chat_id='fake_id',
        text=message,
        parse_mode='Markdown',
        disable_web_page_preview=True
    )

@pytest.mark.asyncio
async def test_send_daily_digest_no_env(mock_bot):
    message = "Test message"
    
    with patch('bot.TELEGRAM_BOT_TOKEN', None), patch('bot.TELEGRAM_CHAT_ID', 'fake_id'):
        result = await send_daily_digest(message)
    
    # Should exit early and return False
    assert result is False
    mock_bot.send_message.assert_not_called()

@pytest.mark.asyncio
async def test_send_daily_digest_timeout(mock_bot):
    message = "Test message"
    mock_bot.send_message.side_effect = TimedOut()
    
    with patch('bot.TELEGRAM_BOT_TOKEN', 'fake_token'), patch('bot.TELEGRAM_CHAT_ID', 'fake_id'):
        result = await send_daily_digest(message)
    
    assert result is False
    mock_bot.send_message.assert_called_once()
