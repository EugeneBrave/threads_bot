---
name: Threads Bot Architecture & Guidelines
description: Project architecture, coding conventions, scraping rules, AI pipeline, and frontend guidelines for the Threads Daily Style Bot repository.
---

# Threads Bot Architecture & Guidelines

This skill serves as the reference manual for working within the **Threads 每日穿搭精選** codebase.

## Project Overview
A Python-based Threads scraper + Google Gemini AI digest pipeline + Telegram bot + React/TypeScript editorial web viewer deployed on GitHub Pages.

- **Goal:** Scrape recent (within 30 days) men's fashion, American vintage, workwear, Japanese menswear, and vintage clothing posts from Threads (Chinese, English, and Japanese keywords), filter out store ads & irrelevant noise, summarize/translate trends into Traditional Chinese via Gemini AI, and publish to Telegram and GitHub Pages.
- **Data Flow:** `scraper.py` (Playwright + 30-day & Layer-1 ad filter) -> `ai_processor.py` (Gemini structured JSON digest + Layer-2 semantic ad/noise filter) -> `main.py` -> `web/public/data/posts.json` (5-day rolling archive) -> React Web Viewer (`web/`) + Telegram (`bot.py`).

## Tech Stack & Key Files
1. `config.py`: Central configuration (`KEYWORDS`, `POSTS_PER_KEYWORD`, `MAX_POST_AGE_DAYS = 30`, env vars).
2. `scraper.py`: Async `playwright` scraper.
   - Extracts `permalink`, `username`, `post_date`, `content`, `likes`, `comments`, `reposts`, `shares`.
   - Enforces `MAX_POST_AGE_DAYS` via `is_within_days()` (supports DOM `<time datetime>`, absolute dates, and zh-TW/JP/EN relative times) with automatic `&filter=recent` fallback.
   - Deduplicates URLs via `normalize_url()` (unifies `threads.com`/`threads.net`, strips query strings & `/media`).
   - Pre-filters obvious store ads via `is_likely_ad()`.
3. `ai_processor.py`: Uses the official `google-genai` SDK (`from google import genai`).
   - Dynamically discovers and selects the latest lightweight text models (`select_latest_lightweight_models()`, preferring `flash-lite` -> `flash` -> official `-latest` aliases) with retry & fallback.
   - Uses Pydantic `response_schema=DigestResponse` (`title`, `intro`, `highlights`, `excluded_urls`) and `system_instruction`.
   - Synthesizes/translates multilingual posts (ZH/EN/JP) into Traditional Chinese.
4. `main.py`: Orchestrator. Excludes existing permalinks from `posts.json`, removes AI-flagged `excluded_urls` before saving, keeps the latest 5 days in `web/public/data/posts.json`, and sends the formatted digest via `bot.py`.
5. `web/`: React 19 + TypeScript + Redux Toolkit + `styled-components` editorial magazine UI (POPEYE / Lightning aesthetic).
   - Multi-column Bento grid on desktop, single column on mobile.
   - Native `color-scheme` + `light-dark()` Light/Dark theme toggle with FOUC prevention in `web/index.html` and `web/src/styles/GlobalStyles.ts`.
   - `web/src/features/posts/postsSlice.ts`: Fetches `posts.json` from GitHub Raw URL in production and `/public/data/posts.json` in local dev.
6. `.github/workflows/`:
   - `daily_run.yml`: Runs `python main.py --now` daily at 01:00 UTC and commits updated `posts.json`.
   - `deploy_web.yml`: Two-job (`build` -> `deploy`) GitHub Pages deployment workflow.

## Important Rules for AI Agents
- **Playwright Only:** Never replace `scraper.py` with `requests` for scraping Threads.
- **Data Integrity:** `posts.json` is keyed by `YYYY-MM-DD` and retains the latest 5 days. Preserve the `Post` and `AiSummaryData` schema.
- **Async & Windows:** Keep the Windows `Proactor` event loop patch in `main.py` and keep IO-bound tasks `async`.
- **Frontend Styling:** Use `styled-components` and CSS custom properties defined in `GlobalStyles.ts` (avoid hardcoded hex colors that break Light/Dark theme switching). Never use `dangerouslySetInnerHTML`.
- **Virtual Environment (macOS):** Use `venv/bin/python` and `venv/bin/pip` instead of system Homebrew Python.

## Development & Code Quality
- **Python tests:** `venv/bin/python -m pytest -v`
- **Frontend tests & build:** `npm --prefix web test -- --run && npm --prefix web run build`
- **Pre-commit hook:** Located at `.githooks/pre-commit` (runs `pytest`, `vitest`, `tsc --noEmit`, and `scripts/ai_code_review.py`). Enable locally with:
  ```bash
  git config core.hooksPath .githooks
  ```

## Adding New Keywords
Update `KEYWORDS` in `config.py`. The scraper, AI summarizer, and frontend filter chips will automatically pick up the new tags.
