from __future__ import annotations

import json
import threading
from pathlib import Path

from app.models.schemas import RepoMetadata


class MetadataStore:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._lock = threading.Lock()

    def _read_all(self) -> dict[str, dict]:
        if not self.db_path.exists():
            return {}
        raw = self.db_path.read_text(encoding="utf-8")
        if not raw.strip():
            return {}
        return json.loads(raw)

    def _write_all(self, payload: dict[str, dict]) -> None:
        self.db_path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")

    def upsert_repo(self, metadata: RepoMetadata) -> None:
        with self._lock:
            payload = self._read_all()
            payload[metadata.repo_id] = metadata.model_dump(mode="json")
            self._write_all(payload)

    def get_repo(self, repo_id: str) -> RepoMetadata | None:
        with self._lock:
            payload = self._read_all()
            item = payload.get(repo_id)
            if not item:
                return None
            return RepoMetadata.model_validate(item)

    def list_repos(self) -> list[RepoMetadata]:
        with self._lock:
            payload = self._read_all()
            return [RepoMetadata.model_validate(item) for item in payload.values()]
