from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_repo_service
from app.models.schemas import IngestRequest, IngestResponse, RepoMetadata
from app.services.repo_service import RepoService

router = APIRouter(prefix="/api/repos", tags=["repos"])


@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_repo(
    request: IngestRequest,
    repo_service: RepoService = Depends(get_repo_service),
) -> IngestResponse:
    try:
        return repo_service.ingest_repository(str(request.repo_url))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/{repo_id}", response_model=RepoMetadata)
def get_repo(repo_id: str, repo_service: RepoService = Depends(get_repo_service)) -> RepoMetadata:
    repo = repo_service.get_repository(repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")
    return repo
