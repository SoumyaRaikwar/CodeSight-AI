from urllib.parse import urlparse


class RepoValidationError(ValueError):
    pass


def validate_github_url(repo_url: str) -> tuple[str, str]:
    parsed = urlparse(repo_url)
    if parsed.scheme not in {"http", "https"}:
        raise RepoValidationError("Repository URL must be HTTP/HTTPS")
    if parsed.netloc.lower() != "github.com":
        raise RepoValidationError("Only github.com repositories are supported")

    parts = [p for p in parsed.path.strip("/").split("/") if p]
    if len(parts) < 2:
        raise RepoValidationError("Repository URL must include owner/repo")

    owner, repo = parts[0], parts[1].replace(".git", "")
    if not owner or not repo:
        raise RepoValidationError("Invalid repository path")
    return owner, repo
