import pytest
from unittest.mock import AsyncMock, MagicMock
from scraper import get_top_daily_posts

@pytest.fixture
def mock_playwright(mocker):
    mock_pw = mocker.patch('scraper.async_playwright')
    mock_browser = AsyncMock()
    mock_context = AsyncMock()
    mock_page = AsyncMock()
    
    mock_pw.return_value.__aenter__.return_value.chromium.launch.return_value = mock_browser
    mock_browser.new_context.return_value = mock_context
    mock_context.new_page.return_value = mock_page
    
    # Mock page.evaluate to return some dummy posts
    mock_page.evaluate.return_value = [
        {"text": "Sample fashion post 1", "permalink": "https://www.threads.net/t/abcdef1"},
        {"text": "Awesome vintage outfit", "permalink": "https://www.threads.net/t/abcdef2"}
    ]
    
    return mock_pw, mock_page

@pytest.mark.asyncio
async def test_get_top_daily_posts_success(mock_playwright):
    _, mock_page = mock_playwright
    
    posts = await get_top_daily_posts()
    
    # It should have crawled the 3 keywords in KEYWORDS configuration
    assert len(posts) == 2 # 3 keywords, but mock returns same permalinks so deduplication reduces to 2
    assert "Sample fashion post 1" in posts[0]['text']
    assert "https://www.threads.net/t/abcdef2" in posts[1]['permalink']
    assert mock_page.goto.call_count == 3

@pytest.mark.asyncio
async def test_get_top_daily_posts_empty(mocker, mock_playwright):
    _, mock_page = mock_playwright
    mock_page.evaluate.return_value = []
    
    posts = await get_top_daily_posts()
    
    assert len(posts) == 0
    assert mock_page.goto.call_count == 3
