import pytest
from unittest.mock import AsyncMock, patch
from ai_processor import generate_digest
import json

@pytest.mark.asyncio
async def test_generate_digest_success(mocker):
    posts = [
        {"content": "Sample fashion post 1", "permalink": "https://www.threads.net/t/abcdef1", "username": "user1", "likes": 10},
        {"content": "Sample vintage outfit", "permalink": "https://www.threads.net/t/abcdef2", "username": "user2", "likes": 20}
    ]
    
    # Mock google.genai.Client
    mock_client = AsyncMock()
    mock_response = AsyncMock()
    # Mock return JSON as string (simulating Gemini response)
    mock_response.text = json.dumps({
        "title": "今日 Threads 穿搭熱門追蹤",
        "intro": "這是一個測試摘要",
        "highlights": [
            {"title": "精選 1", "description": "描述 1", "url": "url1"}
        ]
    })
    
    mock_client.aio.models.generate_content.return_value = mock_response
    
    with patch('ai_processor.client', mock_client):
        result = await generate_digest(posts)
        
    assert isinstance(result, dict)
    assert result["title"] == "今日 Threads 穿搭熱門追蹤"
    assert len(result["highlights"]) == 1
    mock_client.aio.models.generate_content.assert_called_once()

@pytest.mark.asyncio
async def test_generate_digest_fallback(mocker):
    posts = [
        {"content": "Sample fashion post 1", "permalink": "https://www.threads.net/t/abcdef1", "username": "user1"},
    ]
    
    # Mock missing client scenario
    with patch('ai_processor.client', None):
        result = await generate_digest(posts)
        
    assert isinstance(result, dict)
    assert "AI 摘要未啟用" in result["title"]
    assert len(result["highlights"]) == 1
    assert result["highlights"][0]["url"] == "https://www.threads.net/t/abcdef1"

@pytest.mark.asyncio
async def test_generate_digest_empty():
    result = await generate_digest([])
    assert isinstance(result, dict)
    assert "今日無擷取到新貼文" in result["title"]
    assert result["highlights"] == []
