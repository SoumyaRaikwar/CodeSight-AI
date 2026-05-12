from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_notes_service
from app.models.schemas import Note, NoteRequest, NotesListResponse
from app.services.notes_service import NotesService

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.post("/generate", response_model=Note, status_code=status.HTTP_201_CREATED)
def generate_note(
    request: NoteRequest,
    notes_service: NotesService = Depends(get_notes_service),
) -> Note:
    try:
        return notes_service.generate_note(request.repo_id, request.note_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/{repo_id}", response_model=NotesListResponse)
def list_notes(repo_id: str, notes_service: NotesService = Depends(get_notes_service)) -> NotesListResponse:
    return notes_service.get_notes(repo_id)
