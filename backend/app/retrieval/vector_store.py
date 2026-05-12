from __future__ import annotations

from pathlib import Path
from typing import Any

import chromadb
from sentence_transformers import SentenceTransformer

from app.models.schemas import ChunkMetadata, RetrievalHit


class VectorStore:
    def __init__(self, persist_path: Path, model_name: str):
        self._model = SentenceTransformer(model_name)
        self._client = chromadb.PersistentClient(path=str(persist_path))
        self._collection = self._client.get_or_create_collection(name="codesight_chunks")

    def upsert_chunks(self, repo_id: str, chunks: list[dict[str, Any]]) -> None:
        if not chunks:
            return

        ids: list[str] = []
        documents: list[str] = []
        metadatas: list[dict[str, Any]] = []

        for chunk in chunks:
            metadata = chunk["metadata"]
            cid = f"{repo_id}:{metadata['file_path']}:{metadata['line_start']}:{metadata['line_end']}"
            ids.append(cid)
            documents.append(chunk["content"])
            metadatas.append(metadata)

        # Chroma enforces a max batch size; large repos can exceed it.
        max_batch = int(self._client.get_max_batch_size())
        batch_size = min(max_batch, 2048)

        for start in range(0, len(documents), batch_size):
            end = min(start + batch_size, len(documents))
            batch_docs = documents[start:end]
            batch_ids = ids[start:end]
            batch_metas = metadatas[start:end]
            batch_embeddings = self._model.encode(batch_docs, normalize_embeddings=True).tolist()
            self._collection.upsert(
                ids=batch_ids,
                documents=batch_docs,
                embeddings=batch_embeddings,
                metadatas=batch_metas,
            )

    def search(self, repo_id: str, query: str, k: int = 8) -> list[RetrievalHit]:
        vector = self._model.encode([query], normalize_embeddings=True).tolist()[0]
        result = self._collection.query(
            query_embeddings=[vector],
            n_results=k,
            where={"repo_id": repo_id},
            include=["documents", "distances", "metadatas"],
        )

        docs = result.get("documents", [[]])[0]
        distances = result.get("distances", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]

        hits: list[RetrievalHit] = []
        for doc, distance, metadata in zip(docs, distances, metadatas):
            score = 1 - float(distance)
            chunk_meta = ChunkMetadata.model_validate(metadata)
            hits.append(RetrievalHit(content=doc, score=score, metadata=chunk_meta))

        hits.sort(key=lambda item: item.score, reverse=True)
        return hits
