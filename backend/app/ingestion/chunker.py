from __future__ import annotations

import re
from pathlib import Path

from app.models.schemas import ChunkMetadata

LANG_MAP = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".java": "java",
    ".go": "go",
    ".rs": "rust",
    ".md": "markdown",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
}

SYMBOL_PATTERNS = [
    re.compile(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)"),
    re.compile(r"^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)"),
    re.compile(r"^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)"),
    re.compile(r"^\s*(?:const|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\("),
    re.compile(r"^\s*export\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)"),
    re.compile(r"^\s*pub\s+fn\s+([A-Za-z_][A-Za-z0-9_]*)"),
]

HEADER_PATTERN = re.compile(r"^#{1,3}\s+(.+)$")


def _language_for(path: Path) -> str:
    return LANG_MAP.get(path.suffix.lower(), "text")


def _chunk_type(language: str) -> str:
    if language == "markdown":
        return "doc_section"
    if language in {"python", "typescript", "javascript", "java", "go", "rust"}:
        return "function"
    return "text"


def _find_symbol(line: str) -> str | None:
    for pattern in SYMBOL_PATTERNS:
        match = pattern.search(line)
        if match:
            return match.group(1)
    return None


def chunk_file(repo_id: str, repo_path: Path, file_path: Path, max_lines: int = 140) -> list[dict]:
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    language = _language_for(file_path)

    chunks: list[dict] = []
    start_idx = 0
    current_symbol: str | None = None

    def flush(end_idx: int, symbol: str | None, chunk_type: str) -> None:
        if end_idx < start_idx:
            return
        snippet = "\n".join(lines[start_idx : end_idx + 1]).strip()
        if not snippet:
            return
        rel_path = str(file_path.relative_to(repo_path))
        metadata = ChunkMetadata(
            repo_id=repo_id,
            file_path=rel_path,
            language=language,
            symbol=symbol,
            chunk_type=chunk_type,  # type: ignore[arg-type]
            line_start=start_idx + 1,
            line_end=end_idx + 1,
        )
        chunks.append({"content": snippet, "metadata": metadata.model_dump()})

    for idx, line in enumerate(lines):
        symbol = _find_symbol(line)
        if language == "markdown":
            header_match = HEADER_PATTERN.search(line)
            if header_match and idx > start_idx:
                flush(idx - 1, current_symbol, "doc_section")
                start_idx = idx
                current_symbol = header_match.group(1)
                continue

        if symbol and idx > start_idx:
            flush(idx - 1, current_symbol, _chunk_type(language))
            start_idx = idx
            current_symbol = symbol
            continue

        if idx - start_idx + 1 >= max_lines:
            flush(idx, current_symbol, _chunk_type(language))
            start_idx = idx + 1
            current_symbol = None

    if start_idx < len(lines):
        flush(len(lines) - 1, current_symbol, _chunk_type(language))

    return chunks
