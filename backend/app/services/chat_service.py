from __future__ import annotations

from app.agent.graph import build_graph
from app.core.config import Settings
from app.mcp.adapter import CodeWikiMCPAdapter
from app.models.schemas import ChatRequest, ChatResponse, Reference
from app.retrieval.vector_store import VectorStore
from app.services.llm_service import LLMService
from app.utils.metadata_store import MetadataStore


class ChatService:
    def __init__(
        self,
        settings: Settings,
        store: MetadataStore,
        vector_store: VectorStore,
        mcp_adapter: CodeWikiMCPAdapter,
    ):
        self.settings = settings
        self.store = store
        self.vector_store = vector_store
        self.mcp_adapter = mcp_adapter
        self.llm = LLMService(settings)
        self.graph = build_graph(
            vector_store=self.vector_store,
            mcp_adapter=self.mcp_adapter,
            llm=self.llm,
            top_k=self.settings.top_k,
        )

    def answer_query(self, request: ChatRequest) -> ChatResponse:
        repo = self.store.get_repo(request.repo_id)
        if not repo:
            raise ValueError("Repository not found")
        if repo.status != "indexed":
            raise ValueError("Repository is not indexed")

        state = self.graph.invoke(
            {"repo_id": request.repo_id, "repo_url": repo.repo_url, "query": request.query}
        )

        references: list[Reference] = []
        for hit in state.get("hits", [])[:6]:
            references.append(
                Reference(
                    file_path=hit.metadata.file_path,
                    symbol=hit.metadata.symbol,
                    line_start=hit.metadata.line_start,
                    line_end=hit.metadata.line_end,
                    reason=f"Relevance score: {hit.score:.2f}",
                )
            )

        return ChatResponse(
            answer=state.get("answer_draft", "No answer generated."),
            references=references,
            diagram=state.get("diagram"),
            tool_trace=state.get("tool_trace", []),
            notes_suggestions=state.get("notes_suggestions", ["onboarding", "architecture"]),
        )
