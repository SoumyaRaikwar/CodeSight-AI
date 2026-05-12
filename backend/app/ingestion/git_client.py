from pathlib import Path

from git import GitCommandError, Repo


class CloneError(RuntimeError):
    pass


def clone_repository(repo_url: str, destination: Path) -> Path:
    if destination.exists() and any(destination.iterdir()):
        return destination
    destination.mkdir(parents=True, exist_ok=True)
    try:
        Repo.clone_from(repo_url, destination)
    except GitCommandError as exc:
        raise CloneError(f"Failed to clone repository: {exc}") from exc
    return destination
