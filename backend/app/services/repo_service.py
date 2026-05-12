from __future__ import annotations

from datetime import datetime

from app.core.config import Settings
from app.ingestion.pipeline import ingest_repository
from app.models.schemas import IngestResponse, RepoMetadata
from app.retrieval.vector_store import VectorStore
from app.utils.id import make_repo_id
from app.utils.metadata_store import MetadataStore


class RepoService:
    def __init__(self, settings: Settings, store: MetadataStore, vector_store: VectorStore):
        self.settings = settings
        self.store = store
        self.vector_store = vector_store

    def ingest_repository(self, repo_url: str) -> IngestResponse:
        repo_id = make_repo_id(repo_url)

        metadata = RepoMetadata(
            repo_id=repo_id,
            repo_url=repo_url,
            repo_name="",
            local_path=str(self.settings.repos_dir / repo_id),
            status="pending",
        )
        self.store.upsert_repo(metadata)

        try:
            result = ingest_repository(repo_id, repo_url, self.settings.repos_dir, self.settings)
            self.vector_store.upsert_chunks(repo_id=repo_id, chunks=result["chunks"])

            updated = RepoMetadata(
                repo_id=repo_id,
                repo_url=repo_url,
                repo_name=result["repo_name"],
                local_path=result["local_path"],
                status="indexed",
                summary=result["summary"],
                tree_preview=result["tree_preview"],
                indexed_files=len(result["files"]),
                created_at=metadata.created_at,
                updated_at=datetime.utcnow(),
            )
            self.store.upsert_repo(updated)

            return IngestResponse(
                repo_id=repo_id,
                status="indexed",
                repo_name=updated.repo_name,
                summary=updated.summary,
                tree_preview=updated.tree_preview,
            )
        except Exception:
            failed = metadata.model_copy(update={"status": "failed", "updated_at": datetime.utcnow()})
            self.store.upsert_repo(failed)
            raise

    def get_repository(self, repo_id: str) -> RepoMetadata | None:
        return self.store.get_repo(repo_id)
