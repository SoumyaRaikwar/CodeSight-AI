from pathlib import Path

from app.ingestion.chunker import chunk_file


def test_chunker_extracts_function_chunks(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    file = repo / "main.py"
    file.write_text("def alpha():\n    return 1\n\n\ndef beta():\n    return 2\n")

    chunks = chunk_file(repo_id="repo1", repo_path=repo, file_path=file)
    assert len(chunks) >= 2
    assert any(chunk["metadata"]["symbol"] == "alpha" for chunk in chunks)
