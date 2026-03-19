import logging
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Configure Gemini
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# System prompt to guide the AI
SYSTEM_PROMPT = """
你是一個專業的時尚趨勢分析師與社群觀察家，專精於分析 Threads 上的流行穿搭與復古穿搭風格。
我會提供你一份今天從 Threads 上爬取下來的熱門貼文清單。

你的任務是：
1. **過濾雜訊**：忽略與穿搭、復古、男裝完全無關的內容。
2. **總結趨勢**：閱讀剩下來的高質量貼文，撰寫今日穿搭趨勢摘要。
3. **列出精華貼文**：挑選 3-5 篇最具代表性的貼文並提供摘要。

【重要：輸出格式】
請嚴格以 JSON 格式輸出，不得包含任何 Markdown 代碼塊標籤或額外文字。包含以下欄位：
- "title": 摘要標題，例如 "今日 Threads 穿搭熱門追蹤"
- "intro": 趨勢總結摘要內容。
- "highlights": 數組，每個物件包含：
    - "title": 貼文標題或亮點
    - "description": 貼文的簡短摘要說明
    - "url": 貼文的原文連結
"""

async def generate_digest(posts: list[dict]) -> dict:
    """
    Process the scraped posts through Gemini and return a structured dict.
    """
    if not posts:
        return {
            "title": "今日無擷取到新貼文！",
            "intro": "今天沒有抓取到符合關鍵字的貼文，請稍後再試。",
            "highlights": []
        }

    # Format posts for the prompt
    posts_text = "【今日擷取到的 Threads 貼文清單】\n\n"
    for i, p in enumerate(posts, 1):
        content = p.get('content', '').replace('\n', ' ')
        username = p.get('username', '未知用戶')
        likes = p.get('likes', 0)
        kw = p.get('keyword', '無')
        
        posts_text += f"貼文 {i} (@{username}) [關鍵字: {kw}]:\n"
        posts_text += f"內容: {content}\n"
        posts_text += f"數據: {likes}個讚\n"
        posts_text += f"連結: {p['permalink']}\n\n"
        
    prompt = f"{SYSTEM_PROMPT}\n\n{posts_text}\n\n請以 JSON 格式開始你的分析："

    # Try Gemini First
    if client:
        try:
            logger.info("Attempting to generate digest using Google Gemini...")
            response = await client.aio.models.generate_content(
                model='gemini-3-flash-preview',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                ),
            )
            if response.text:
                import json
                try:
                    data = json.loads(response.text)
                    logger.info("Successfully generated structured digest using Gemini.")
                    return data
                except json.JSONDecodeError:
                    logger.error("Failed to parse Gemini JSON response.")
            else:
                logger.warning("Gemini returned empty response. Falling back...")
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            logger.info("Falling back...")
    else:
        logger.warning("GEMINI_API_KEY not found. Skipping Gemini.")
        
    # Fallback to basic structure
    logger.warning("Gemini API failed or key missing. Returning basic list.")
    highlights = []
    for p in posts[:5]:
        text_preview = p.get('content', '')[:50].replace('\n', ' ') + "..."
        highlights.append({
            "title": f"來自 @{p.get('username', '未知用戶')} 的貼文",
            "description": text_preview,
            "url": p.get('permalink', '')
        })
        
    return {
        "title": "今日 Threads 穿搭熱門追蹤 (AI 摘要未啟用)",
        "intro": f"今日共擷取到 {len(posts)} 篇相關貼文。以下是部分精選內容：",
        "highlights": highlights
    }
