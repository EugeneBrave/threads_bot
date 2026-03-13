import asyncio
import logging
from playwright.async_api import async_playwright
from config import KEYWORDS

logger = logging.getLogger(__name__)

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
    
    # Wait for the post elements to load. We look for the main container or links
    # Threads uses dynamic classes, but links to posts usually have '/t/' in the href
    try:
        # Wait for the first post to appear
        await page.wait_for_selector("a[href*='/post/']", timeout=15000)
        logger.info("Found posts selector.")
    except Exception as e:
        title = await page.title()
        url = page.url
        logger.warning(f"Failed to find posts. Title: '{title}', URL: '{url}'")
        return []

    logger.info("Starting scroll...")
    # Scroll down a few times to load more posts if limit is high
    for i in range(3):
        logger.info(f"Scroll {i}")
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2) # Give it time to load

    logger.info("Extracting data via evaluate...")
    
    valid_items = await page.evaluate('''() => {
        const results = [];
        const links = document.querySelectorAll("a[href*='/post/']");
        
        links.forEach(link => {
            const url = link.href;
            if (!url) return;
            
            // Try to find text by going up the DOM tree and finding innerText
            let text = "";
            let container = link.closest('div[data-pressable-container="true"]');
            if (container) {
                text = container.innerText;
            } else {
                text = link.parentElement ? link.parentElement.innerText : "";
            }
            
            // Avoid duplicates and simple noise (like just "Like" text)
            if (text && text.length > 5 && !results.some(r => r.permalink === url)) {
                results.push({
                    permalink: url,
                    text: text.trim().substring(0, 300) + (text.length > 300 ? "..." : "")
                });
            }
        });
        
        return results;
    }''')
    
    logger.info(f"Evaluated successfully. Found {len(valid_items)} items.")
    return valid_items[:limit]

async def get_top_daily_posts(keywords: list = KEYWORDS, total_limit: int = 10):
    all_posts = []
    seen_permalinks = set()
    limit_per_keyword = max(total_limit // len(keywords), 1) + 2
    
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
                posts = await fetch_posts_for_keyword(page, keyword, limit=limit_per_keyword)
                for post in posts:
                    if post["permalink"] not in seen_permalinks:
                        seen_permalinks.add(post["permalink"])
                        all_posts.append(post)
            except Exception as e:
                logger.error(f"Error scraping {keyword}: {e}")
        
        await browser.close()
        
    return all_posts[:total_limit]

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    posts = asyncio.run(get_top_daily_posts())
    print(f"Fetched {len(posts)} posts:")
    for p in posts:
        print(p)
