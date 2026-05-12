from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class IngestRequest(BaseModel):
    repo_url: HttpUrl


class RepoTreeNode(BaseModel):
    path: str
    kind: Literal["file", "dir"]


class RepoMetadata(BaseModel):
    repo_id: str
    repo_url: str
    repo_name: str
    local_path: str
    status: Literal["pending", "indexed", "failed"]
    summary: str = ""
    tree_preview: list[RepoTreeNode] = Field(default_factory=list)
    indexed_files: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IngestResponse(BaseModel):
    repo_id: str
    status: str
    repo_name: str
    summary: str
    tree_preview: list[RepoTreeNode]


class ChunkMetadata(BaseModel):
    repo_id: str
    file_path: str
    language: str
    symbol: str | None = None
    chunk_type: Literal["function", "class", "module", "doc_section", "text"]
    line_start: int
    line_end: int


class RetrievalHit(BaseModel):
    content: str
    score: float
    metadata: ChunkMetadata


class Diagram(BaseModel):
    type: Literal["mermaid"] = "mermaid"
    content: str


class Reference(BaseModel):
    file_path: str
    symbol: str | None = None
    line_start: int
    line_end: int
    reason: str


class ChatRequest(BaseModel):
    repo_id: str
    query: str


class ChatResponse(BaseModel):
    answer: str
    references: list[Reference]
    diagram: Diagram | None = None
    tool_trace: list[str]
    notes_suggestions: list[str]


class NoteRequest(BaseModel):
    repo_id: str
    note_type: Literal["onboarding", "architecture", "auth-flow", "api-flow", "key-modules"]


class Note(BaseModel):
    repo_id: str
    note_type: str
    content: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class NotesListResponse(BaseModel):
    repo_id: str
    notes: list[Note]


class HealthResponse(BaseModel):
    status: str


class ToolTrace(BaseModel):
    tools: list[str]
