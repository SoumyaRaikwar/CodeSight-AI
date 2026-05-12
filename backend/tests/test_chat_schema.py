from app.models.schemas import ChatResponse, Diagram, Reference


def test_chat_response_schema() -> None:
    payload = ChatResponse(
        answer="Auth handled in middleware.",
        references=[
            Reference(
                file_path="src/auth.ts",
                symbol="requireAuth",
                line_start=10,
                line_end=42,
                reason="Contains middleware logic",
            )
        ],
        diagram=Diagram(type="mermaid", content="flowchart TD\nA-->B"),
        tool_trace=["retriever", "repo_mapper"],
        notes_suggestions=["onboarding"],
    )
    assert payload.references[0].file_path == "src/auth.ts"
