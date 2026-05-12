from app.models.schemas import Diagram


class DiagramService:
    @staticmethod
    def fallback_diagram() -> Diagram:
        return Diagram(
            type="mermaid",
            content="flowchart TD\nQ[User Query] --> R[Retriever]\nR --> A[Answer Composer]",
        )
