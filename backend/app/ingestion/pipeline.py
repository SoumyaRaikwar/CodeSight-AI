from __future__ import annotations

from pathlib import Path

from app.core.config import Settings
from app.ingestion.chunker import chunk_file
from app.ingestion.git_client import clone_repository
from app.ingestion.scanner import build_tree_preview, scan_repository_files
from app.ingestion.validator import validate_github_url
from app.models.schemas import RepoTreeNode


def ingest_repository(repo_id: str, repo_url: str, target_dir: Path, settings: Settings) -> dict:
    owner, repo = validate_github_url(repo_url)
    local_path = target_dir / repo_id
    clone_repository(repo_url, local_path)

    files = scan_repository_files(local_path, settings)
    chunks: list[dict] = []
    for file in files:
        chunks.extend(chunk_file(repo_id=repo_id, repo_path=local_path, file_path=file))

    tree_preview = [RepoTreeNode(**node) for node in build_tree_preview(local_path, files)]
    summary = (
        f"Indexed {len(files)} files and {len(chunks)} chunks for {owner}/{repo}. "
        f"Top files include: {', '.join([str(path.relative_to(local_path)) for path in files[:5]])}"
    )

    return {
        "repo_name": f"{owner}/{repo}",
        "local_path": str(local_path),
        "files": files,
        "chunks": chunks,
        "summary": summary,
        "tree_preview": tree_preview,
    }
