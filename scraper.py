import asyncio
import logging
from playwright.async_api import async_playwright
from config import KEYWORDS, POSTS_PER_KEYWORD

logger = logging.getLogger(__name__)

def normalize_url(url: str) -> str:
    """Normalize Threads URL by stripping /media/ and trailing slashes."""
    if not url:
        return ""
    # Strip trailing slash
    url = url.rstrip('/')
    # Strip /media suffix
    if url.endswith('/media'):
        url = url[:-6]
    return url

async def fetch_posts_for_keyword(page, keyword, limit):
    """
    Search Threads for a given keyword and extract the posts.
    """
    url = f"https://www.threads.net/search?q={keyword}"
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
    # Scroll more times to find newer content
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
                if (/^\\d+天$/.test(lines[i]) || /^\\d+小時$/.test(lines[i])) {
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

async def get_top_daily_posts(keywords: list = KEYWORDS, posts_per_keyword: int = POSTS_PER_KEYWORD, exclude_permalinks: list = None):
    all_posts = []
    # Initialize seen_permalinks with normalized exclusions
    seen_permalinks = set()
    if exclude_permalinks:
        for url in exclude_permalinks:
            seen_permalinks.add(normalize_url(url))
            
    total_excluded_initial = len(seen_permalinks)
    
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
                # Get more than the limit to allow for filtering duplicates
                posts = await fetch_posts_for_keyword(page, keyword, limit=posts_per_keyword * 10)
                count_for_this_keyword = 0
                for post in posts:
                    if count_for_this_keyword >= posts_per_keyword:
                        break
                    
                    norm_url = normalize_url(post["permalink"])
                    if norm_url not in seen_permalinks:
                        seen_permalinks.add(norm_url)
                        post["keyword"] = keyword
                        all_posts.append(post)
                        count_for_this_keyword += 1
                
                logger.info(f"Added {count_for_this_keyword} new posts for keyword: {keyword}")
            except Exception as e:
                logger.error(f"Error scraping {keyword}: {e}")
        
        await browser.close()
    
    new_posts_count = len(all_posts)
    logger.info(f"Scraping finished. Total new posts: {new_posts_count}. (Exclusions active: {len(seen_permalinks)})")
    return all_posts

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    posts = asyncio.run(get_top_daily_posts())
    print(f"Fetched {len(posts)} posts:")
    for p in posts:
        print(p)
