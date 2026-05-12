from pathlib import Path

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "target",
    ".next",
    "__pycache__",
    "venv",
    ".venv",
}

INCLUDED_EXTENSIONS = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".java",
    ".go",
    ".rs",
    ".md",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".sql",
    ".sh",
    ".env.example",
}


BINARY_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".mp4",
    ".mp3",
    ".dll",
    ".so",
    ".dylib",
}


def should_include_file(path: Path, max_file_size_bytes: int) -> bool:
    if any(part in EXCLUDED_DIRS for part in path.parts):
        return False

    if path.suffix.lower() in BINARY_EXTENSIONS:
        return False

    if path.stat().st_size > max_file_size_bytes:
        return False

    if path.name.lower() in {"dockerfile", "makefile", "readme", "readme.md"}:
        return True

    suffix = path.suffix.lower()
    return suffix in INCLUDED_EXTENSIONS
