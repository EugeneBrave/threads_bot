---
name: AI Code Reviewer
description: Reviews staged code changes using Gemini AI through a git pre-commit hook or manual execution before committing.
---

# Code Reviewer Skill

This skill allows the agent to perform an automated code review on staged changes (`git diff --staged`) using the `scripts/ai_code_review.py` utility. The script is powered by `google-genai` and uses Gemini 2.5 Flash.

## Prerequisites
1. Ensure `google-genai` is installed.
2. The `GEMINI_API_KEY` environment variable must be set.

## Usage Instructions

### 1. Manual Execution
If the user asks you to "review my code" or perform a "code review" before they commit:
1. Ensure the user has staged their changes (`git add`).
2. Run the script directly:
   ```bash
   python scripts/ai_code_review.py
   ```
3. Read the output. If the script flags any issues (it will say `❌ AI Code Review FAILED`), read the provided AI feedback, summarize the critical issues, and proactively fix them using code edit tools.

### 2. Pre-commit Hook
The repository is also equipped with a Git pre-commit hook located at `.githooks/pre-commit` which automatically runs `pytest` and then this AI Code Review script.

To instruct the user on how to enable this hook locally so it runs every time they type `git commit`, tell them to run:
```bash
git config core.hooksPath .githooks
```
If the commit fails due to the hook, the hook will output the errors to the terminal, blocking the commit until the code is fixed and passes both the unit tests and the AI's review.
