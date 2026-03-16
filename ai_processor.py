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
我會提供你一份今天從 Threads 上爬取下來的「男生穿搭」、「美式復古」、「阿美咔嘰」等相關熱門貼文清單。每一條貼文包含「貼文內容」與對應的「專屬永久連結(permalink)」。

你的任務是：
1. **過濾雜訊**：忽略與穿搭、復古、男裝完全無關的內容（垃圾訊息、廣告、純屬抱怨等）。
2. **總結趨勢**：閱讀剩下來的高質量穿搭貼文，寫一段 100~200 字左右的「今日穿搭趨勢速報或摘要」。語氣要輕鬆、專業、帶點推坑感。
3. **列出精華貼文**：在總結下方，整理出最具參考價值的精選貼文。為每一篇貼文寫一句簡短的亮點介紹，並一定要附上該貼文的原始連結。

【重要：輸出格式】
你的輸出將直接發送到 Telegram，請嚴格使用支援的 Markdown 語法格式：
- 標題使用粗體：*今日 Threads 穿搭熱門追蹤* (不要用 # )
- 加粗使用單星號：*粗體字* (Telegram 標題與重點建議使用此寫法)
- 連結寫法：[點我觀看原文](https://www.threads.net/...)
- 若清單使用條列式，可用 `-`

請直接給出最後要發送的訊息內容，不要有任何其他前言或你的內心獨白。
"""

async def generate_digest(posts: list[dict]) -> str:
    """
    Process the scraped posts through Gemini (primary), falling back to Claude.
    Returns the generated Markdown string.
    """
    if not posts:
        return "*今日無擷取到新貼文！*"

    # Format posts for the prompt
    posts_text = "【今日擷取到的 Threads 貼文清單】\n\n"
    for i, p in enumerate(posts, 1):
        # Truncate text slightly if needed just to save tokens, though 300 should be fine
        text = p['text'].replace('\n', ' ')
        posts_text += f"貼文 {i}:\n內容: {text}\n連結: {p['permalink']}\n\n"
        
    prompt = f"{SYSTEM_PROMPT}\n\n{posts_text}\n\n請開始你的分析與撰寫："

    # Try Gemini First
    if client:
        try:
            logger.info("Attempting to generate digest using Google Gemini...")
            # Using the gemini-2.5-flash model
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
