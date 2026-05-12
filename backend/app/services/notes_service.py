from __future__ import annotations

import json
from pathlib import Path

from app.core.config import Settings
from app.models.schemas import Note, NotesListResponse
from app.prompts.notes import NOTES_PROMPT
from app.retrieval.vector_store import VectorStore
from app.services.llm_service import LLMService
from app.utils.metadata_store import MetadataStore


class NotesService:
    def __init__(self, settings: Settings, store: MetadataStore, vector_store: VectorStore):
        self.settings = settings
        self.store = store
        self.vector_store = vector_store
        self.llm = LLMService(settings)

    def _note_path(self, repo_id: str) -> Path:
        return self.settings.notes_dir / f"{repo_id}.json"

    def _load_notes(self, repo_id: str) -> list[Note]:
        path = self._note_path(repo_id)
        if not path.exists():
            return []
        data = json.loads(path.read_text(encoding="utf-8"))
        return [Note.model_validate(item) for item in data]

    def _save_notes(self, repo_id: str, notes: list[Note]) -> None:
        path = self._note_path(repo_id)
        path.write_text(
            json.dumps([n.model_dump(mode="json") for n in notes], indent=2),
            encoding="utf-8",
        )

    def generate_note(self, repo_id: str, note_type: str) -> Note:
        repo = self.store.get_repo(repo_id)
        if not repo:
            raise ValueError("Repository not found")

        hits = self.vector_store.search(repo_id=repo_id, query=f"{note_type} overview", k=10)
        ctx = "\n\n".join(
            f"{h.metadata.file_path}:{h.metadata.line_start}-{h.metadata.line_end}\n{h.content[:800]}"
            for h in hits
        )
        fallback = (
            f"# {note_type.title()} Notes\n\n"
            f"Repository: {repo.repo_name}\n\n"
            f"No LLM configured. Review these files:\n"
            + "\n".join(f"- {h.metadata.file_path}" for h in hits[:8])
        )
        content = self.llm.generate(
            system_prompt="You are a precise developer educator.",
            user_prompt=NOTES_PROMPT.format(note_type=note_type) + f"\n\nContext:\n{ctx}",
            fallback=fallback,
        )

        note = Note(repo_id=repo_id, note_type=note_type, content=content)
        notes = [n for n in self._load_notes(repo_id) if n.note_type != note_type]
        notes.append(note)
        self._save_notes(repo_id, notes)
        return note

    def get_notes(self, repo_id: str) -> NotesListResponse:
        return NotesListResponse(repo_id=repo_id, notes=self._load_notes(repo_id))
