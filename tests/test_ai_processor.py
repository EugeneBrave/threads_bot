import pytest
from unittest.mock import AsyncMock, patch
from ai_processor import generate_digest

@pytest.mark.asyncio
async def test_generate_digest_success(mocker):
    posts = [
        {"text": "Sample fashion post 1", "permalink": "https://www.threads.net/t/abcdef1"},
        {"text": "Sample vintage outfit", "permalink": "https://www.threads.net/t/abcdef2"}
    ]
    
    # Mock google.genai.Client
    mock_client = AsyncMock()
    mock_response = AsyncMock()
    mock_response.text = "*今日 Threads 穿搭熱門追蹤*\n\n1. Sample summary"
    
    mock_client.aio.models.generate_content.return_value = mock_response
    
    with patch('ai_processor.client', mock_client):
        result = await generate_digest(posts)
        
    assert "*今日 Threads 穿搭熱門追蹤*" in result
    mock_client.aio.models.generate_content.assert_called_once()

@pytest.mark.asyncio
async def test_generate_digest_fallback(mocker):
    posts = [
        {"text": "Sample fashion post 1", "permalink": "https://www.threads.net/t/abcdef1"},
    ]
    
    # Mock missing client scenario
    with patch('ai_processor.client', None):
        result = await generate_digest(posts)
        
    assert "🧵 *今日 Threads 穿搭熱門追蹤 (AI 摘要未啟用)* 🧵" in result
    assert "Sample fashion post 1" in result
    assert "https://www.threads.net/t/abcdef1" in result

@pytest.mark.asyncio
async def test_generate_digest_empty():
    result = await generate_digest([])
    assert result == "*今日無擷取到新貼文！*"
