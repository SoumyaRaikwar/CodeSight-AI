from functools import lru_cache

from app.core.config import get_settings
from app.mcp.adapter import CodeWikiMCPAdapter
from app.retrieval.vector_store import VectorStore
from app.services.chat_service import ChatService
from app.services.notes_service import NotesService
from app.services.repo_service import RepoService
from app.utils.metadata_store import MetadataStore


@lru_cache
def get_metadata_store() -> MetadataStore:
    settings = get_settings()
    return MetadataStore(settings.metadata_db_path)


@lru_cache
def get_vector_store() -> VectorStore:
    settings = get_settings()
    return VectorStore(persist_path=settings.chroma_path, model_name=settings.embedding_model_name)


@lru_cache
def get_mcp_adapter() -> CodeWikiMCPAdapter:
    settings = get_settings()
    return CodeWikiMCPAdapter(
        enabled=settings.mcp_enabled,
        endpoint=settings.mcp_codewiki_endpoint,
        timeout_seconds=settings.mcp_timeout_seconds,
        max_retries=settings.mcp_max_retries,
    )


@lru_cache
def get_repo_service() -> RepoService:
    return RepoService(
        settings=get_settings(),
        store=get_metadata_store(),
        vector_store=get_vector_store(),
    )


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(
        settings=get_settings(),
        store=get_metadata_store(),
        vector_store=get_vector_store(),
        mcp_adapter=get_mcp_adapter(),
    )


@lru_cache
def get_notes_service() -> NotesService:
    return NotesService(
        settings=get_settings(),
        store=get_metadata_store(),
        vector_store=get_vector_store(),
    )
