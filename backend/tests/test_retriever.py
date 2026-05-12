from app.retrieval.retriever import retrieve_context
from app.models.schemas import ChunkMetadata, RetrievalHit


class FakeVectorStore:
    def search(self, repo_id: str, query: str, k: int):
        return [
            RetrievalHit(
                content=f"{repo_id}:{query}:{k}",
                score=0.9,
                metadata=ChunkMetadata(
                    repo_id=repo_id,
                    file_path="src/auth.py",
                    language="python",
                    symbol="login",
                    chunk_type="function",
                    line_start=1,
                    line_end=20,
                ),
            )
        ]


def test_retrieve_context_pass_through() -> None:
    result = retrieve_context(FakeVectorStore(), "repo1", "auth flow", 5)
    assert result[0].content == "repo1:auth flow:5"
