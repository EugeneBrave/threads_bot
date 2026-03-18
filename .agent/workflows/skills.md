---
name: "Threads Bot Architecture & Tools"
description: "Instructions and skills on how to work within the Threads Telegram Bot project"
---

# 🤖 Threads Telegram Bot Skills & Guidelines

This document serves as the AI Agent's instruction manual for interacting with this specific project codebase.

## 📌 Project Overview
The "Threads Bot" is a Python-based web scraper, Telegram messenger, and a React-based Web Viewer.
- **Goal:** Scrape men's fashion trends ("男生穿搭", "美式復古", "阿美咔嘰") from Threads.net, process the data using Google Gemini AI, and display it via Telegram and a GitHub Pages web app.
- **Data Flow:** `scraper.py` (Data) -> `main.py` -> `posts.json` (Storage) -> React Web App (Viewer).

## 🛠️ Tech Stack & Key Files
When asked to modify the project, refer to these core files:
1. `scraper.py`: Handles web scraping. **Skill:** Uses async `playwright`. Extracts **structured data** (username, date, content, likes, comments, reposts).
2. `ai_processor.py`: Handles LLM integration. **Skill:** Uses `google-generativeai`. **Model:** `gemini-2.5-flash`. It processes structured JSON and formats a markdown summary.
3. `web/`: React frontend. **Skill:** React 19, TypeScript, Redux Toolkit, and `styled-components`.
   - `web/src/features/posts/postsSlice.ts`: Fetches `posts.json` directly from **GitHub Raw URL** in production to avoid rebuilds.
4. `main.py`: The orchestrator. Saves data to `web/public/data/posts.json`.
5. `.github/workflows/`:
   - `daily_run.yml`: Runs the bot daily and commits new data.
   - `deploy_web.yml`: Deploys the React app (only triggers on `web/` source changes).

## ⚠️ Important Rules for AI Agents
If you are asked to make changes to this repository, follow these rules carefully:

### 1. Web Scraping & Data Structure
- **Playwright Only:** Never use `requests` for scraping Threads.
- **Structured Extraction:** The scraper identifies usernames, dates, and engagement stats from the raw text. Ensure any selector updates maintain these fields.
- **Data Integrity:** `posts.json` is a keyed object by date: `{"YYYY-MM-DD": { ... }}`. Always preserve the last 5 days.

### 2. Frontend Development
- **Styling:** Use **styled-components** exclusively. Do not add `index.css` rules unless global.
- **Data Fetching:** Production data is fetched from the GitHub Raw URL. Local dev fetches from `/public/data/`.
- **Markdown Parsing:** The `AiSummary.tsx` component handles parsing the AI's markdown output (bold, links). Do not use `dangerouslySetInnerHTML` without careful sanitization.

### 3. Async & Windows
- **Proactor Patch:** Keep the pipe transport patch in `main.py` for Windows compatibility.
- Ensure all IO-bound tasks remain `async`.

## 🛡️ Development & Code Quality
### Pre-commit Hook
The project uses a custom hook in `.githooks/pre-commit`. It runs:
1. `pytest` (Backend tests)
2. `tsc` (TypeScript type check in `web/`)
3. `ai_code_review.py` (Gemini-powered code review)

**Agent Task:** If the user mentions commit issues, ensure they have run:
```bash
git config core.hooksPath .githooks
```

## 🚀 Adding New Keywords
Update `KEYWORDS` in `config.py`. The scraper and frontend will automatically pick up the new tags.
