import asyncio
import logging
from playwright.async_api import async_playwright
from config import KEYWORDS, POSTS_PER_KEYWORD

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
            
            let rawText = "";
            let container = link.closest('div[data-pressable-container="true"]');
            if (container) {
                rawText = container.innerText;
            } else {
                rawText = link.parentElement ? link.parentElement.innerText : "";
            }
            
            if (!rawText || rawText.length <= 5 || results.some(r => r.permalink === url)) return;
            
            // Parse the raw text into structured fields
            const lines = rawText.trim().split('\\n').map(l => l.trim()).filter(l => l.length > 0);
            
            // First line is usually the username
            const username = lines.length > 0 ? lines[0] : '';
            
            // Find date line (pattern: YYYY-M-D or YYYY/M/D or contains 天 like "6天")
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
            
            // Extract engagement numbers from the end (likes, comments, reposts, shares)
            // They appear as the last 3-4 lines, each being a number (possibly with commas or 萬)
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
            
            // Content is everything between header lines and engagement numbers
            // Skip: username, possible tag line before date, date, "翻譯" noise
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
    return valid_items[:limit]

async def get_top_daily_posts(keywords: list = KEYWORDS, posts_per_keyword: int = POSTS_PER_KEYWORD):
    all_posts = []
    seen_permalinks = set()
    
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
                posts = await fetch_posts_for_keyword(page, keyword, limit=posts_per_keyword)
                for post in posts:
                    if post["permalink"] not in seen_permalinks:
                        seen_permalinks.add(post["permalink"])
                        post["keyword"] = keyword
                        all_posts.append(post)
            except Exception as e:
                logger.error(f"Error scraping {keyword}: {e}")
        
        await browser.close()
        
    return all_posts

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    posts = asyncio.run(get_top_daily_posts())
    print(f"Fetched {len(posts)} posts:")
    for p in posts:
        print(p)
