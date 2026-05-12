from __future__ import annotations

import logging

from langchain_openai import ChatOpenAI

from app.core.config import Settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client: ChatOpenAI | None = None
        if settings.llm_api_key:
            self._client = ChatOpenAI(
                model=settings.llm_model,
                api_key=settings.llm_api_key,
                base_url=settings.llm_api_base,
                temperature=settings.llm_temperature,
                max_tokens=settings.llm_max_tokens,
            )

    def generate(self, system_prompt: str, user_prompt: str, fallback: str) -> str:
        if not self._client:
            return fallback
        try:
            message = self._client.invoke(
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
            )
            content = message.content
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                return "\n".join(part.get("text", "") for part in content if isinstance(part, dict)).strip()
            return fallback
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM generation failed, fallback used: %s", exc)
            return fallback
