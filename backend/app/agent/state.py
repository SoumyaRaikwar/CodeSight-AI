from __future__ import annotations

from typing import TypedDict

from app.mcp.schemas import MCPResult
from app.models.schemas import Diagram, RetrievalHit


class AgentState(TypedDict, total=False):
    repo_id: str
    repo_url: str
    query: str
    intent: str
    hits: list[RetrievalHit]
    repo_map: list[str]
    mcp_result: MCPResult
    answer_draft: str
    diagram: Diagram | None
    notes_suggestions: list[str]
    tool_trace: list[str]
