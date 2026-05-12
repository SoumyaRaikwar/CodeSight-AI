import pytest

from app.ingestion.validator import RepoValidationError, validate_github_url


def test_validate_github_url_success() -> None:
    owner, repo = validate_github_url("https://github.com/openai/openai-python")
    assert owner == "openai"
    assert repo == "openai-python"


def test_validate_github_url_failure() -> None:
    with pytest.raises(RepoValidationError):
        validate_github_url("https://gitlab.com/org/repo")
