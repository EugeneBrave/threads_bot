---
name: "Threads Bot Architecture & Tools"
description: "Instructions and skills on how to work within the Threads Telegram Bot project"
---

# 🤖 Threads Telegram Bot Skills & Guidelines

This document serves as the AI Agent's instruction manual for interacting with this specific project codebase.

## 📌 Project Overview
The "Threads Bot" is a Python-based web scraper and Telegram messenger. 
- **Goal:** Scrape men's fashion trends ("男生穿搭", "美式復古", "阿美咔嘰") from Threads.net, process the data using Google Gemini AI, and send a formatted markdown summary to a Telegram Chat.
- **Trigger:** It can run locally via `schedule` or automatically in the cloud via GitHub Actions.

## 🛠️ Tech Stack & Key Files
When asked to modify the project, refer to these core files:
1. `scraper.py`: Handles web scraping. **Skill:** Uses async `playwright`. Selectors parse dynamic React DOM (`a[href*='/post/']`).
2. `ai_processor.py`: Handles LLM integration. **Skill:** Uses `google-generativeai`. It formats scraped content into a markdown digest. **Model:** `gemini-3-flash-preview`. 
3. `bot.py`: Handles Telegram delivery. **Skill:** Uses `python-telegram-bot` (v21.0.1). Sends `ParseMode.MARKDOWN`.
4. `main.py`: The orchestrator. Sets up local `schedule` or runs immediately if injected with `--now`.
5. `.github/workflows/daily_run.yml`: Handles cloud CI/CD. Requires environment variables to be passed.

## ⚠️ Important Rules for AI Agents
If you are asked to make changes to this repository, follow these rules carefully:

### 1. Web Scraping Resiliency
Threads is a dynamic React application. Playwright is used to bypass simple bot restrictions.
- **NEVER** use `requests` or `BeautifulSoup` to scrape Threads directly; it will fail. Always use `playwright`.
- **CSS Selectors**: Threads' HTML tags change often. Always use robust selectors like `a[href*='/post/']` or `[data-pressable-container="true"]`.
- Always wrap `page.goto` in `try/except` and use `wait_until="domcontentloaded"` because Threads search pages often timeout on network idle.

### 2. Async/Await Compatibility
This project heavily relies on asynchronous Python (`asyncio`).
- `get_top_daily_posts` (Playwright), `generate_digest` (Gemini), and `send_daily_digest` (Telegram) are all `async`.
- In `main.py`, they are orchestrated via `async_job()`.
- **Windows Fix:** Leave the `_ProactorBasePipeTransport.__del__` patch at the top of `main.py` intact. It suppresses a harmless but annoying `RuntimeError: Event loop is closed` specific to Windows and Playwright.

### 3. API Key Management
- Local development relies on `config.py` loading `.env`.
- **DO NOT** hardcode keys into scripts. Always use `os.getenv()`.
- If modifying keys, update `.env.example`, `config.py`, and the GitHub Actions `.yml` file concurrently.

### 4. Running the Bot
- **Local Dev Testing:** Use `python main.py --now` to run once instantly.
// turbo
- **Start Local Scheduler:** Use `python main.py` to start the script in polling mode (runs at 09:00 AM daily).

## 🚀 Adding New Keywords
To add a new search term, simply append it to the `KEYWORDS` list in `config.py`. The scraper will automatically fetch `POSTS_PER_KEYWORD` (default 5) for it.
