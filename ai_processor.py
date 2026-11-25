import asyncio
import json
import logging
import re
from pydantic import BaseModel
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Configure Gemini Client (google-genai SDK)
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Fallback models if dynamic discovery is unavailable
DEFAULT_GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
]

EXCLUDED_MODEL_KEYWORDS = (
    "tts",
    "image",
    "live",
    "audio",
    "transcribe",
    "embedding",
    "robotics",
    "computer-use",
    "omni",
    "decision",
    "nano-banana",
    "customtools",
    "thinking",
)


class Highlight(BaseModel):
    title: str
    description: str
    url: str


class DigestResponse(BaseModel):
    title: str
    intro: str
    highlights: list[Highlight]
    excluded_urls: list[str] = []


SYSTEM_PROMPT = """你是一個專業的時尚趨勢分析師與社群觀察家，專精於分析 Threads 上的流行穿搭與復古穿搭風格。
我會提供你一份今天從 Threads 上爬取下來的熱門貼文清單（內容可能包含中文、英文或日文）。

你的任務是：
1. 過濾廣告與雜訊：
   - 識別並排除任何「店家廣告、商業宣傳、導購軟廣、品牌自推、代購、抽獎導流、假裝個人分享的店家清單（如：這幾家必存／這間一定要逛）」貼文。
   - 識別並排除與穿搭、男裝、美式復古、工裝、日系古著完全無關的雜訊貼文（例如追星、政治、純交友文）。
   - 將上述需要排除的貼文原始連結完整放入 `excluded_urls` 欄位。
2. 總結趨勢：僅根據「未被排除」的真實穿搭貼文（英／日文貼文請自然整合翻譯），以繁體中文撰寫今日穿搭趨勢摘要。
3. 列出精華貼文：從未被排除的高質量貼文中挑選 3-5 篇最具代表性的貼文並以繁體中文提供摘要，切勿將 `excluded_urls` 中的貼文放入 `highlights`。

請以繁體中文輸出，並確保每則 `url` 與 `excluded_urls` 皆與原始貼文連結完全一致。"""


def _parse_model_sort_key(model_name: str) -> tuple[int, tuple[int, ...], int] | None:
    """
    Score a Gemini model for lightweight text digest tasks.
    Returns (tier_priority, version_tuple, is_stable) or None if unsuitable.
    Higher tuple = preferred.
    """
    name = model_name.lower()
    if not name.startswith("gemini-"):
        return None
    if any(bad in name for bad in EXCLUDED_MODEL_KEYWORDS):
        return None

    match = re.match(r"^gemini-(\d+(?:\.\d+)*)-(flash-lite|flash)(?:-(preview))?$", name)
    if not match:
        return None

    version_str, tier, preview = match.groups()
    version_tuple = tuple(int(part) for part in version_str.split("."))
    # Prefer flash-lite (lightweight) over regular flash
    tier_priority = 2 if tier == "flash-lite" else 1
    is_stable = 0 if preview else 1
    return (tier_priority, version_tuple, is_stable)


def select_latest_lightweight_models(genai_client, max_candidates: int = 4) -> list[str]:
    """
    Dynamically inspect available Gemini models and return the latest lightweight
    models (flash-lite first, then flash), with official aliases as fallback.
    """
    try:
        available = list(genai_client.models.list())
    except Exception as e:
        logger.debug("Could not list Gemini models dynamically: %s", e)
        return list(DEFAULT_GEMINI_MODELS)

    scored: list[tuple[tuple[int, tuple[int, ...], int], str]] = []
    available_names: set[str] = set()

    for m in available:
        raw_name = getattr(m, "name", None)
        if not isinstance(raw_name, str):
            continue
        short_name = raw_name.removeprefix("models/")
        available_names.add(short_name)

        score = _parse_model_sort_key(short_name)
        if score is not None:
            scored.append((score, short_name))

    if not scored:
        return list(DEFAULT_GEMINI_MODELS)

    # Sort descending: flash-lite > flash, newest version > older, stable > preview
    scored.sort(key=lambda item: item[0], reverse=True)

    candidates: list[str] = []
    # Pick top flash-lite and top flash so fallback spans both tiers
    top_lite = [name for score, name in scored if score[0] == 2]
    top_flash = [name for score, name in scored if score[0] == 1]

    for name in top_lite[:2]:
        if name not in candidates:
            candidates.append(name)
    if "gemini-flash-lite-latest" in available_names and "gemini-flash-lite-latest" not in candidates:
        candidates.append("gemini-flash-lite-latest")
    for name in top_flash[:1]:
        if name not in candidates:
            candidates.append(name)
    if "gemini-flash-latest" in available_names and "gemini-flash-latest" not in candidates:
        candidates.append("gemini-flash-latest")

    return candidates[:max_candidates] or list(DEFAULT_GEMINI_MODELS)


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, stripping accidental markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


async def generate_digest(posts: list[dict]) -> dict:
    """
    Process the scraped posts through Gemini and return a structured dict.
    """
    if not posts:
        return {
            "title": "今日無擷取到新貼文！",
            "intro": "今天沒有抓取到符合關鍵字的貼文，請稍後再試。",
            "highlights": [],
        }

    # Format posts for the prompt
    posts_text = "【今日擷取到的 Threads 貼文清單】\n\n"
    for i, p in enumerate(posts, 1):
        content = p.get("content", "").replace("\n", " ")
        username = p.get("username", "未知用戶")
        likes = p.get("likes", 0)
        kw = p.get("keyword", "無")

        posts_text += f"貼文 {i} (@{username}) [關鍵字: {kw}]:\n"
        posts_text += f"內容: {content}\n"
        posts_text += f"數據: {likes}個讚\n"
        posts_text += f"連結: {p['permalink']}\n\n"

    user_prompt = f"{posts_text}\n請根據以上貼文產出今日穿搭趨勢摘要。"

    if client:
        candidate_models = select_latest_lightweight_models(client)
        logger.info("Selected Gemini candidate models: %s", candidate_models)

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=DigestResponse,
            temperature=0.4,
        )

        for model_name in candidate_models:
            for attempt in range(2):
                try:
                    logger.info(
                        "Generating digest with Gemini model=%s (attempt %d)...",
                        model_name,
                        attempt + 1,
                    )
                    response = await client.aio.models.generate_content(
                        model=model_name,
                        contents=user_prompt,
                        config=config,
                    )
                    if response.text:
                        data = _parse_json_response(response.text)
                        logger.info(
                            "Successfully generated structured digest using %s.",
                            model_name,
                        )
                        return data
                    logger.warning("Gemini model=%s returned empty response.", model_name)
                except json.JSONDecodeError as e:
                    logger.error(
                        "Failed to parse Gemini JSON response from %s: %s",
                        model_name,
                        e,
                    )
                except Exception as e:
                    logger.error(
                        "Gemini API Error (model=%s, attempt=%d): %s",
                        model_name,
                        attempt + 1,
                        e,
                    )
                    if attempt == 0:
                        await asyncio.sleep(2)
    else:
        logger.warning("GEMINI_API_KEY not found. Skipping Gemini.")

    # Fallback to basic structure
    logger.warning("Gemini API failed or key missing. Returning basic list.")
    highlights = []
    for p in posts[:5]:
        text_preview = p.get("content", "")[:50].replace("\n", " ") + "..."
        highlights.append(
            {
                "title": f"來自 @{p.get('username', '未知用戶')} 的貼文",
                "description": text_preview,
                "url": p.get("permalink", ""),
            }
        )

    return {
        "title": "今日 Threads 穿搭熱門追蹤 (AI 摘要未啟用)",
        "intro": f"今日共擷取到 {len(posts)} 篇相關貼文。以下是部分精選內容：",
        "highlights": highlights,
    }
