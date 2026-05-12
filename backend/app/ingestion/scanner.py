from pathlib import Path

from app.core.config import Settings
from app.ingestion.file_filter import should_include_file


def scan_repository_files(repo_path: Path, settings: Settings) -> list[Path]:
    files: list[Path] = []
    for path in repo_path.rglob("*"):
        if not path.is_file():
            continue
        if should_include_file(path, settings.max_file_size_bytes):
            files.append(path)
    return files


def build_tree_preview(repo_path: Path, files: list[Path], max_nodes: int = 120) -> list[dict[str, str]]:
    nodes: list[dict[str, str]] = []
    seen_dirs: set[str] = set()
    for file_path in files[:max_nodes]:
        rel = str(file_path.relative_to(repo_path))
        parts = rel.split("/")
        current = []
        for part in parts[:-1]:
            current.append(part)
            d = "/".join(current)
            if d not in seen_dirs:
                nodes.append({"path": d, "kind": "dir"})
                seen_dirs.add(d)
        nodes.append({"path": rel, "kind": "file"})
        if len(nodes) >= max_nodes:
            break
    return nodes[:max_nodes]
