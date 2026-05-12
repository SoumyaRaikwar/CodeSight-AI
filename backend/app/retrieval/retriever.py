from app.models.schemas import RetrievalHit
from app.retrieval.vector_store import VectorStore


def retrieve_context(vector_store: VectorStore, repo_id: str, query: str, k: int) -> list[RetrievalHit]:
    return vector_store.search(repo_id=repo_id, query=query, k=k)
