import os
from typing import List, Dict

import httpx

MAX_SNIPPET_CHARS = 900
MAX_CONTEXT_CHARS = 4000


def _clamp(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "..."


def _build_context(results: List[Dict]) -> str:
    if not results:
        return "No indexed code snippets were found for this question."

    pieces = []
    remaining = MAX_CONTEXT_CHARS
    for idx, result in enumerate(results, start=1):
        snippet = _clamp(result.get("content", ""), MAX_SNIPPET_CHARS)
        entry = (
            f"[Snippet {idx}]\n"
            f"File: {result.get('file')}\n"
            f"Lines: {result.get('line_start')} - {result.get('line_end')}\n"
            f"Code:\n{snippet}\n"
        )
        if len(entry) > remaining:
            break
        pieces.append(entry)
        remaining -= len(entry)

    return "\n".join(pieces) if pieces else "No indexed code snippets were found for this question."


async def generate_human_answer(question: str, results: List[Dict]) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured on the server.")

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    app_url = os.getenv("OPENAI_APP_URL")
    app_name = os.getenv("OPENAI_APP_NAME")

    context = _build_context(results)
    system_prompt = (
        "You are a helpful codebase assistant. Answer in clear, simple language. "
        "Be concise, avoid jargon, and use short examples if they help. "
        "If the context is insufficient, say what is missing and suggest the next step."
    )
    user_prompt = (
        f"Question:\n{question}\n\n"
        f"Relevant code snippets:\n{context}\n\n"
        "Provide a human-readable answer suitable for displaying directly in a UI."
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 350,
    }

    timeout = httpx.Timeout(30.0, connect=10.0)
    headers = {"Authorization": f"Bearer {api_key}"}
    if app_url:
        headers["HTTP-Referer"] = app_url
    if app_name:
        headers["X-Title"] = app_name

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json=payload,
        )

    response.raise_for_status()
    data = response.json()
    message = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    return message.strip() or "I could not generate a readable answer from the available context."
