import asyncio
import logging
import re
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit
from playwright.async_api import async_playwright
from config import KEYWORDS, POSTS_PER_KEYWORD, MAX_POST_AGE_DAYS

logger = logging.getLogger(__name__)

# Layer 1: High-confidence commercial / ad keywords
STRONG_AD_KEYWORDS = (
    "私訊下單",
    "私訊購買",
    "點主頁連結",
    "主頁下單",
    "主頁連結",
    "蝦皮賣場",
    "賣貨便",
    "官網下單",
    "下單連結",
    "商城連結",
    "滿額免運",
    "折扣碼",
    "優惠碼",
    "限時優惠",
    "現貨供應",
    "批發",
    "代購",
    "團購",
    "開幕慶",
    "週年慶",
    "官方line",
    "line官方",
    "立即購買",
    "限時搶購",
)

SHOP_USERNAME_PATTERNS = (
    "_shop",
    "_store",
    "_select",
    "_official",
    "_boutique",
    "selectshop",
    "選物",
    "古著店",
)

SHOP_PROMO_CUES = (
    "新品",
    "上架",
    "現貨",
    "優惠",
    "特價",
    "售價",
    "nt$",
    "官網",
    "門市",
    "實體店",
    "連結",
    "私訊",
)


def normalize_url(url: str) -> str:
    """
    Normalize Threads URL:
    - Unify threads.com and threads.net
    - Strip query string and fragment (e.g. ?xmt=...)
    - Strip trailing slash and /media suffix
    """
    if not url:
        return ""
    parts = urlsplit(url.strip())
    netloc = parts.netloc.lower().replace("threads.com", "threads.net")
    path = parts.path.rstrip("/")
    if path.endswith("/media"):
        path = path[:-6]
    return urlunsplit((parts.scheme or "https", netloc, path, "", ""))


def is_likely_ad(post: dict) -> bool:
    """
    Fast rule-based pre-filter (Layer 1) to catch obvious store ads and
    spoiler-bait shop promotion templates before taking up keyword slots.
    """
    content = (post.get("content") or "").strip()
    username = (post.get("username") or "").strip().lower()
    content_lower = content.lower()

    # 1. Unambiguous commercial / checkout CTA
    if any(kw in content_lower for kw in STRONG_AD_KEYWORDS):
        return True

    # 2. Threads spoiler-bait shop list template (e.g. "這幾間必存" + repeated "劇透")
    if content.count("劇透") >= 3 and any(
        cue in content for cue in ("必存", "這幾間", "這幾家", "這間", "一定要逛", "店家")
    ):
        return True

    # 3. Storefront promo combo (business hours / physical store + promo/visit CTA)
    if any(k in content for k in ("營業時間", "門市地址", "實體店")) and any(
        k in content for k in ("地址", "私訊", "一定", "來逛", "開幕", "門市", "優惠")
    ):
        return True

    # 4. Commercial storefront username + promo cue
    if any(pat in username for pat in SHOP_USERNAME_PATTERNS) and any(
        cue in content_lower for cue in SHOP_PROMO_CUES
    ):
        return True

    return False


def is_within_days(
    post_date: str,
    max_days: int = MAX_POST_AGE_DAYS,
    post_datetime: str = "",
    now: datetime | None = None,
) -> bool:
    """
    Check whether a post's date is within `max_days` from `now`.
    Supports ISO-8601 `post_datetime` (from <time datetime="...">),
    absolute dates (YYYY-M-D / YYYY/M/D), and relative strings (e.g. 22小時, 3天, 2週).
    """
    ref_now = now or datetime.now(timezone.utc)
    if ref_now.tzinfo is None:
        ref_now = ref_now.replace(tzinfo=timezone.utc)

    # 1. Prefer exact ISO timestamp from <time datetime="...">
    if post_datetime:
        try:
            iso_str = post_datetime.strip().replace("Z", "+00:00")
            parsed_dt = datetime.fromisoformat(iso_str)
            if parsed_dt.tzinfo is None:
                parsed_dt = parsed_dt.replace(tzinfo=timezone.utc)
            age_days = (ref_now - parsed_dt).total_seconds() / 86400
            return -1 <= age_days <= max_days
        except ValueError:
            pass

    if not post_date:
        return False

    text = post_date.strip()

    # 2. Relative formats (zh-TW, Japanese & English)
    if re.match(r"^\d+\s*(?:秒|分鐘|分|小時|時間|s|m|h)$", text, re.IGNORECASE):
        return True

    day_match = re.match(r"^(\d+)\s*(?:天|日|d)$", text, re.IGNORECASE)
    if day_match:
        return int(day_match.group(1)) <= max_days

    week_match = re.match(r"^(\d+)\s*(?:週|周|週間|w)$", text, re.IGNORECASE)
    if week_match:
        return int(week_match.group(1)) * 7 <= max_days

    # 3. Absolute date format: YYYY-M-D or YYYY/M/D
    abs_match = re.match(r"^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$", text)
    if abs_match:
        try:
            year, month, day = map(int, abs_match.groups())
            parsed_date = datetime(year, month, day, tzinfo=timezone.utc).date()
            age_days = (ref_now.date() - parsed_date).days
            return -1 <= age_days <= max_days
        except ValueError:
            return False

    return False


async def fetch_posts_for_keyword(page, keyword, limit, recent_only: bool = False):
    """
    Search Threads for a given keyword and extract the posts.
    """
    url = f"https://www.threads.net/search?q={keyword}"
    if recent_only:
        url += "&filter=recent"
    logger.info(f"Navigating to {url}")
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        logger.warning(f"goto timed out or failed, but we will try to proceed: {e}")

    logger.info("Goto finished. Waiting for selector...")

    try:
        await page.wait_for_selector("a[href*='/post/']", timeout=15000)
        logger.info("Found posts selector.")
    except Exception as e:
        title = await page.title()
        url = page.url
        logger.warning(f"Failed to find posts. Title: '{title}', URL: '{url}'")
        return []

    logger.info("Starting scroll...")
    for i in range(10):
        logger.info(f"Scroll {i}")
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)

    logger.info("Extracting data via evaluate...")

    valid_items = await page.evaluate('''() => {
        const results = [];
        const links = document.querySelectorAll("a[href*='/post/']");

        links.forEach(link => {
            const url = link.href;
            if (!url) return;

            let rawText = "";
            let container = link.closest('div[data-pressable-container="true"]');
            if (container) {
                rawText = container.innerText;
            } else {
                rawText = link.parentElement ? link.parentElement.innerText : "";
            }

            if (!rawText || rawText.length <= 5 || results.some(r => r.permalink === url)) return;

            const timeEl = container ? container.querySelector('time[datetime]') : null;
            const postDatetime = timeEl ? (timeEl.getAttribute('datetime') || '') : '';

            const lines = rawText.trim().split('\\n').map(l => l.trim()).filter(l => l.length > 0);
            const username = lines.length > 0 ? lines[0] : '';

            let postDate = '';
            let dateLineIndex = -1;
            for (let i = 1; i < lines.length; i++) {
                if (/^\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}$/.test(lines[i])) {
                    postDate = lines[i];
                    dateLineIndex = i;
                    break;
                }
                if (/^\\d+(?:秒|分鐘|小時|天|週|周)$/.test(lines[i])) {
                    postDate = lines[i];
                    dateLineIndex = i;
                    break;
                }
            }

            const numPattern = /^[\\d,.]+\\s*萬?$/;
            let engagementStart = lines.length;
            for (let i = lines.length - 1; i >= 0; i--) {
                if (numPattern.test(lines[i])) {
                    engagementStart = i;
                } else {
                    break;
                }
            }

            const engagementLines = lines.slice(engagementStart);
            const parseNum = (s) => {
                if (!s) return 0;
                s = s.replace(/,/g, '').trim();
                if (s.includes('萬')) return Math.round(parseFloat(s) * 10000);
                return parseInt(s, 10) || 0;
            };

            const likes = engagementLines.length > 0 ? parseNum(engagementLines[0]) : 0;
            const comments = engagementLines.length > 1 ? parseNum(engagementLines[1]) : 0;
            const reposts = engagementLines.length > 2 ? parseNum(engagementLines[2]) : 0;
            const shares = engagementLines.length > 3 ? parseNum(engagementLines[3]) : 0;

            const contentStart = dateLineIndex >= 0 ? dateLineIndex + 1 : (lines.length > 1 ? 1 : 0);
            const contentLines = lines.slice(contentStart, engagementStart)
                .filter(l => l !== '翻譯' && l !== '已翻譯' && l !== '顯示較少');
            const content = contentLines.join('\\n').substring(0, 500);

            results.push({
                permalink: url,
                username: username,
                post_date: postDate,
                post_datetime: postDatetime,
                content: content,
                likes: likes,
                comments: comments,
                reposts: reposts,
                shares: shares
            });
        });

        return results;
    }''')

    logger.info(f"Evaluated successfully. Found {len(valid_items)} items.")
    return valid_items


async def get_top_daily_posts(
    keywords: list = KEYWORDS,
    posts_per_keyword: int = POSTS_PER_KEYWORD,
    exclude_permalinks: list = None,
    max_age_days: int = MAX_POST_AGE_DAYS,
):
    all_posts = []
    seen_permalinks = set()
    if exclude_permalinks:
        for url in exclude_permalinks:
            seen_permalinks.add(normalize_url(url))

    def collect_valid_posts(posts: list, keyword: str, current_count: int) -> tuple[int, int, int]:
        skipped_old = 0
        skipped_ads = 0
        for post in posts:
            if current_count >= posts_per_keyword:
                break

            post_datetime = post.pop("post_datetime", "")
            if not is_within_days(
                post.get("post_date", ""),
                max_days=max_age_days,
                post_datetime=post_datetime,
            ):
                skipped_old += 1
                continue

            if is_likely_ad(post):
                skipped_ads += 1
                continue

            norm_url = normalize_url(post["permalink"])
            if norm_url not in seen_permalinks:
                seen_permalinks.add(norm_url)
                post["keyword"] = keyword
                all_posts.append(post)
                current_count += 1
        return current_count, skipped_old, skipped_ads

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="zh-TW"
        )
        page = await context.new_page()
        page.set_default_timeout(60000)

        for keyword in keywords:
            logger.info(f"Scraping Threads for keyword: {keyword}")
            try:
                posts = await fetch_posts_for_keyword(page, keyword, limit=posts_per_keyword * 10)
                count_for_this_keyword, skipped_old, skipped_ads = collect_valid_posts(posts, keyword, 0)

                # If Top search didn't have enough posts within max_age_days, fall back to Recent tab
                if count_for_this_keyword < posts_per_keyword:
                    logger.info(
                        f"Only {count_for_this_keyword}/{posts_per_keyword} posts within {max_age_days} days "
                        f"for '{keyword}' (skipped {skipped_old} older, {skipped_ads} ads). Trying recent filter..."
                    )
                    recent_posts = await fetch_posts_for_keyword(
                        page, keyword, limit=posts_per_keyword * 10, recent_only=True
                    )
                    count_for_this_keyword, skipped_recent_old, skipped_recent_ads = collect_valid_posts(
                        recent_posts, keyword, count_for_this_keyword
                    )
                    skipped_old += skipped_recent_old
                    skipped_ads += skipped_recent_ads

                logger.info(
                    f"Added {count_for_this_keyword} new posts for keyword: {keyword} "
                    f"(skipped {skipped_old} older than {max_age_days} days, {skipped_ads} ads)"
                )
            except Exception as e:
                logger.error(f"Error scraping {keyword}: {e}")

        await browser.close()

    new_posts_count = len(all_posts)
    logger.info(
        f"Scraping finished. Total new posts: {new_posts_count}. "
        f"(Exclusions active: {len(seen_permalinks)}, max_age_days={max_age_days})"
    )
    return all_posts


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    posts = asyncio.run(get_top_daily_posts())
    print(f"Fetched {len(posts)} posts:")
    for p in posts:
        print(p)
