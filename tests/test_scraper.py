from datetime import datetime, timezone
import pytest
from unittest.mock import AsyncMock
from config import KEYWORDS
from scraper import get_top_daily_posts, is_within_days, is_likely_ad, normalize_url


@pytest.fixture
def mock_playwright(mocker):
    mocker.patch('scraper.asyncio.sleep', new_callable=AsyncMock)
    mock_pw = mocker.patch('scraper.async_playwright')
    mock_browser = AsyncMock()
    mock_context = AsyncMock()
    mock_page = AsyncMock()

    mock_pw.return_value.__aenter__.return_value.chromium.launch.return_value = mock_browser
    mock_browser.new_context.return_value = mock_context
    mock_context.new_page.return_value = mock_page

    # Mock page.evaluate to return recent, old, and ad dummy posts
    mock_page.evaluate.return_value = [
        {
            "content": "Sample fashion post 1",
            "permalink": "https://www.threads.net/t/abcdef1",
            "username": "user1",
            "post_date": "3天",
        },
        {
            "content": "Awesome vintage outfit",
            "permalink": "https://www.threads.net/t/abcdef2",
            "username": "user2",
            "post_date": "12小時",
        },
        {
            "content": "Very old post from last year",
            "permalink": "https://www.threads.net/t/oldpost99",
            "username": "olduser",
            "post_date": "2024-03-29",
        },
        {
            "content": "限時優惠！新品上架歡迎私訊下單或點主頁連結",
            "permalink": "https://www.threads.net/t/adpost88",
            "username": "vintage_shop",
            "post_date": "1天",
        },
    ]

    return mock_pw, mock_page


def test_normalize_url():
    assert (
        normalize_url("https://www.threads.com/@user/post/ABC123/media/?xmt=foo")
        == "https://www.threads.net/@user/post/ABC123"
    )
    assert (
        normalize_url("https://www.threads.net/@user/post/ABC123/")
        == "https://www.threads.net/@user/post/ABC123"
    )


def test_is_likely_ad():
    assert is_likely_ad({"username": "foo", "content": "全館滿額免運，點主頁連結下單"}) is True
    assert is_likely_ad({
        "username": "nn.____.99",
        "content": "台灣男生想買美式風格衣服這幾間店家必存！\n劇透\n劇透\n劇透\n劇透",
    }) is True
    assert is_likely_ad({
        "username": "vivi27597620",
        "content": "美式風格實體店，大家有來信義一定要來逛",
    }) is True
    assert is_likely_ad({
        "username": "tokyo_select",
        "content": "本週秋冬新品上架，歡迎私訊詢問尺寸",
    }) is True
    # Genuine personal fashion sharing should NOT be filtered
    assert is_likely_ad({
        "username": "alex_daily",
        "content": "今天穿寬版牛仔褲配古著工裝外套，分享一下秋天的阿美咔嘰日常穿搭！",
    }) is False


def test_is_within_days():
    now = datetime(2026, 11, 26, 12, 0, 0, tzinfo=timezone.utc)

    # Relative formats
    assert is_within_days("22小時", 30, now=now) is True
    assert is_within_days("15分鐘", 30, now=now) is True
    assert is_within_days("5天", 30, now=now) is True
    assert is_within_days("30天", 30, now=now) is True
    assert is_within_days("31天", 30, now=now) is False
    assert is_within_days("3週", 30, now=now) is True
    assert is_within_days("5週", 30, now=now) is False

    # Absolute formats
    assert is_within_days("2026-11-10", 30, now=now) is True
    assert is_within_days("2026-10-27", 30, now=now) is True
    assert is_within_days("2026-10-26", 30, now=now) is False
    assert is_within_days("2025-11-26", 30, now=now) is False
    assert is_within_days("2024-3-29", 30, now=now) is False

    # ISO datetime takes precedence
    assert is_within_days("", 30, post_datetime="2026-11-20T08:00:00Z", now=now) is True
    assert is_within_days("3天", 30, post_datetime="2025-01-01T00:00:00Z", now=now) is False

    # Empty / unknown
    assert is_within_days("", 30, now=now) is False


@pytest.mark.asyncio
async def test_get_top_daily_posts_success(mock_playwright):
    _, mock_page = mock_playwright

    posts = await get_top_daily_posts(posts_per_keyword=2, exclude_permalinks=[])

    # Old 2024 post and ad post are filtered out; 2 unique recent posts remain
    assert len(posts) == 2
    assert "Sample fashion post 1" in posts[0]['content']
    assert "https://www.threads.net/t/abcdef2" in posts[1]['permalink']
    assert all(p['permalink'] != "https://www.threads.net/t/oldpost99" for p in posts)
    assert all(p['permalink'] != "https://www.threads.net/t/adpost88" for p in posts)


@pytest.mark.asyncio
async def test_get_top_daily_posts_empty(mocker, mock_playwright):
    _, mock_page = mock_playwright
    mock_page.evaluate.return_value = []

    posts = await get_top_daily_posts()

    assert len(posts) == 0
    # Each keyword runs Top + Recent fallback when empty
    assert mock_page.goto.call_count == len(KEYWORDS) * 2
