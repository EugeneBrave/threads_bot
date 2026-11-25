#!/usr/bin/env python3
import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Allow importing project-level helpers when invoked as `python scripts/ai_code_review.py`
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai_processor import DEFAULT_GEMINI_MODELS, select_latest_lightweight_models

# Max characters of staged diff to send to Gemini
MAX_DIFF_CHARS = 30000

REVIEW_SYSTEM_PROMPT = """You are an expert, strict, but pragmatic AI code reviewer for the Threads Daily Style Bot repository.
This project contains:
- Python backend (`scraper.py`, `ai_processor.py`, `main.py`, `bot.py`, `config.py`) using Playwright, `google-genai`, and `pytest`.
- React 19 / TypeScript / Redux Toolkit / `styled-components` editorial frontend (`web/`) with Light/Dark theme support via CSS custom properties and `light-dark()`.

Review the staged git diff and look out for:
1. Hardcoded API keys, tokens, passwords, or secrets (CRITICAL).
2. Obvious syntax errors, infinite loops, or broken logic.
3. Missing or broken unit tests when major logic/components are added or changed.
4. TypeScript type errors or unsafe `any` casts that bypass type safety.
5. React anti-patterns: missing keys in lists, direct state mutation, memory leaks from missing cleanup in `useEffect`.
6. Frontend theming & styling: avoid hardcoded hex colors in components that break Light/Dark mode (prefer `var(--...)` tokens from `GlobalStyles.ts`), and avoid `dangerouslySetInnerHTML`.
7. Python backend issues: blocking sync calls inside `async` functions, broken URL normalization/date filtering, or unhandled API errors.

If the code looks acceptable and safe to commit, reply ONLY with the word "PASS".
If there are critical issues, reply with "FAIL" on the first line, followed by a brief bulleted list of the critical issues found."""


def get_staged_diff() -> str:
    """Retrieve the unified diff of staged files, excluding bulky lock/data files."""
    try:
        result = subprocess.run(
            [
                "git",
                "diff",
                "--staged",
                "--",
                ".",
                ":!web/package-lock.json",
                ":!web/public/data/posts.json",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=True,
        )
        diff = result.stdout.strip()
        if len(diff) > MAX_DIFF_CHARS:
            print(
                f"[AI] Staged diff is large ({len(diff)} chars); "
                f"truncating to {MAX_DIFF_CHARS} chars for review."
            )
            diff = diff[:MAX_DIFF_CHARS] + "\n... [diff truncated]"
        return diff
    except subprocess.CalledProcessError as e:
        print(f"Failed to get git diff: {e}")
        sys.exit(0)


def perform_review(diff: str, api_key: str) -> bool:
    """Send diff to Gemini (latest lightweight model with fallback) and return True if passed."""
    client = genai.Client(api_key=api_key)
    candidate_models = select_latest_lightweight_models(client) or list(DEFAULT_GEMINI_MODELS)

    user_prompt = f"Here is the staged git diff:\n\n```diff\n{diff}\n```"
    config = types.GenerateContentConfig(
        system_instruction=REVIEW_SYSTEM_PROMPT,
        temperature=0.2,
    )

    last_error = None
    for model_name in candidate_models:
        try:
            print(f"[AI] Prompting Gemini ({model_name}) for Code Review...")
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=config,
            )

            reply = (response.text or "").strip()
            if not reply:
                print(f"[AI] Empty response from {model_name}, trying next model...")
                continue

            if reply.startswith("PASS"):
                print(f"[AI] Code Review Passed ({model_name})! Clean diff.")
                return True

            print("\n[AI] Code Review FAILED. Please fix the following issues before committing:")
            print("-" * 50)
            print(reply)
            print("-" * 50)
            return False

        except Exception as e:
            last_error = e
            print(f"[AI] Model {model_name} failed ({e}), trying fallback...")

    print(f"[AI] Code Review encountered API errors ({last_error}). Skipping for now...")
    return True


def main():
    load_dotenv(PROJECT_ROOT / ".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[AI] GEMINI_API_KEY not set. Skipping AI Code Review.")
        sys.exit(0)

    diff = get_staged_diff()
    if not diff:
        print("[AI] No staged code changes found to review.")
        sys.exit(0)

    passed = perform_review(diff, api_key)
    if not passed:
        sys.exit(1)


if __name__ == "__main__":
    try:
        if sys.platform == "win32":
            import io
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    except Exception:
        pass
    main()
