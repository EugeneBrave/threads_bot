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

每一條貼文包含：
- **內容(content)**：貼文的文字描述。
- **用戶名(username)**：發文者的帳號。
- **互動數據**：按讚(likes)、留言(comments)、轉發(reposts)等。
- **關鍵字(keyword)**：此貼文被歸類的標籤。

你的任務是：
1. **過濾雜訊**：忽略與穿搭、復古、男裝完全無關的內容（垃圾訊息、廣告、純屬抱怨等）。
2. **總結趨勢**：閱讀剩下來的高質量貼文，寫一段 100~200 字左右的「今日穿搭趨勢速報或摘要」。語氣要輕鬆、專業、帶點推坑感。請參考互動數據來判斷哪些話題最受歡迎。
3. **列出精華貼文**：在總結下方，整理出 3-5 篇最具代表性的貼文。為每一篇寫一句簡短亮點，並附上標註了[點我觀看原文]的連結。

【重要：輸出格式】
你的輸出將直接發送到 Telegram 與 Web 前端，請嚴格使用以下格式：
- 標題：*今日 Threads 穿搭熱門追蹤*
- 重點加粗：使用單星號 *粗體字*
- 連結格式：[點我觀看原文](https://www.threads.net/...)
- 段落之間請保留空行，方便閱讀。

請直接給出最後要發送的訊息內容，不要有任何其他前言。
"""

async def generate_digest(posts: list[dict]) -> str:
    """
    Process the scraped posts through Gemini.
    """
    if not posts:
        return "*今日無擷取到新貼文！*"

    # Format posts for the prompt using new structured fields
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
        
    prompt = f"{SYSTEM_PROMPT}\n\n{posts_text}\n\n請開始你的分析與撰寫："

    # Try Gemini First
    if client:
        try:
            logger.info("Attempting to generate digest using Google Gemini...")
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            if response.text:
                logger.info("Successfully generated digest using Gemini.")
                return response.text
            else:
                logger.warning("Gemini returned empty response. Falling back...")
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            logger.info("Falling back to Claude...")
    else:
        logger.warning("GEMINI_API_KEY not found. Skipping Gemini.")
        
    # If Gemini fails or key is missing, return the basic format
    logger.warning("Gemini API failed or key missing. Returning basic list.")
    fallback_text = "🧵 *今日 Threads 穿搭熱門追蹤 (AI 摘要未啟用)* 🧵\n\n"
    for i, p in enumerate(posts, 1):
        text_preview = p.get('text', '')[:50].replace('\n', ' ') + "..."
        fallback_text += f"{i}. {text_preview}\n"
        fallback_text += f"🔗 [觀看原文]({p['permalink']})\n\n"
    return fallback_text
