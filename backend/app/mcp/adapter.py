from __future__ import annotations

import logging

from app.mcp.client import HTTPMCPClient
from app.mcp.schemas import MCPInsight, MCPResult

logger = logging.getLogger(__name__)


class CodeWikiMCPAdapter:
    def __init__(self, enabled: bool, endpoint: str, timeout_seconds: float, max_retries: int = 1):
        self.enabled = enabled
        self.client = HTTPMCPClient(endpoint=endpoint, timeout_seconds=timeout_seconds)
        self.max_retries = max_retries

    def query(self, repo_url: str, question: str) -> MCPResult:
        if not self.enabled:
            return MCPResult(available=False, error="MCP disabled by configuration")

        payload = {"repo_url": repo_url, "question": question}

        for attempt in range(self.max_retries + 1):
            try:
                data = self.client.call_tool("codewiki", payload)
                insights_raw = data.get("insights", [])
                insights = [MCPInsight.model_validate(item) for item in insights_raw]
                return MCPResult(available=True, insights=insights)
            except Exception as exc:  # noqa: BLE001
                logger.warning("CodeWiki MCP query failed (attempt %s): %s", attempt + 1, exc)
                if attempt >= self.max_retries:
                    return MCPResult(available=False, error=str(exc))

        return MCPResult(available=False, error="Unknown MCP error")
