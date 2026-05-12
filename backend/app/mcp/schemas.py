from pydantic import BaseModel


class MCPInsight(BaseModel):
    title: str
    content: str
    references: list[str] = []


class MCPResult(BaseModel):
    available: bool
    source: str = "codewiki"
    insights: list[MCPInsight] = []
    error: str | None = None
