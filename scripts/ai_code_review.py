#!/usr/bin/env python3
import subprocess
import sys
import os
from google import genai

# Require GEMINI API KEY to perform the review
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠️ GEMINI_API_KEY environment variable not set. Skipping AI Code Review.")
    sys.exit(0)

def get_staged_diff():
    """Retrieve the unified diff of currently staged files."""
    try:
        result = subprocess.run(
            ["git", "diff", "--staged"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Failed to get git diff: {e}")
        sys.exit(0)

def perform_review(diff: str) -> bool:
    """Send diff to Gemini and return True if it passes, False if it fails."""
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert, strict, but pragmatic AI code reviewer.
    This project contains both Python backend code and a React/TypeScript/styled-components frontend (in web/).
    Review the following git diff for a commit.
    
    Look out for:
    1. Hardcoded API keys, passwords, or secrets (CRITICAL).
    2. Obvious syntax errors, infinite loops, or completely broken logic.
    3. Missing tests if a major visual/logic component was added.
    4. TypeScript type errors or unsafe `any` casts that bypass type safety.
    5. React anti-patterns: missing keys in lists, direct state mutation, memory leaks from missing cleanup in useEffect.
    6. styled-components issues: using inline styles where a styled component should be used, or inconsistent theming.
    
    If the code looks acceptable and safe to merge, reply ONLY with the word "PASS".
    If there are critical issues, reply with "FAIL" on the first line, followed by a brief list of the critical issues found.

    Here is the diff:
    ```diff
    {diff}
    ```
    """
    
    try:
        print("🤖 Prompting AI for Code Review...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        reply = response.text.strip()
        if reply.startswith("PASS"):
            print("✅ AI Code Review Passed! Clean diff.")
            return True
        else:
            print("\n❌ AI Code Review FAILED. Please fix the following issues before committing:")
            print("-" * 50)
            print(reply)
            print("-" * 50)
            return False
            
    except Exception as e:
        print(f"⚠️ AI Code Review encountered an API error: {e}. Slipping through for now...")
        return True

def main():
    diff = get_staged_diff()
    if not diff:
        print("No staged changes found to review.")
        sys.exit(0)
        
    passed = perform_review(diff)
    if not passed:
        # Exit with error code to prevent commit
        sys.exit(1)

if __name__ == "__main__":
    main()
