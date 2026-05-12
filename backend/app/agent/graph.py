from __future__ import annotations

from collections import Counter

from langgraph.graph import END, START, StateGraph

from app.agent.state import AgentState
from app.mcp.adapter import CodeWikiMCPAdapter
from app.models.schemas import Diagram
from app.prompts.architecture import SYSTEM_PROMPT
from app.prompts.composer import COMPOSER_PROMPT
from app.prompts.flow import FLOW_PROMPT
from app.prompts.mermaid import MERMAID_PROMPT, MERMAID_REPAIR_PROMPT
from app.retrieval.retriever import retrieve_context
from app.retrieval.vector_store import VectorStore
from app.services.llm_service import LLMService


def _classify_intent(state: AgentState) -> AgentState:
    query = state["query"].lower()
    intent = "general"
    if any(word in query for word in ["architecture", "design", "module", "dependency"]):
        intent = "architecture"
    elif any(word in query for word in ["flow", "sequence", "request", "auth"]):
        intent = "flow"
    elif any(word in query for word in ["onboard", "learn", "getting started", "overview"]):
        intent = "onboarding"
    state["intent"] = intent
    state["tool_trace"] = ["classify_intent"]
    return state


def _run_retriever(state: AgentState, vector_store: VectorStore, top_k: int) -> AgentState:
    hits = retrieve_context(vector_store, state["repo_id"], state["query"], k=top_k)
    state["hits"] = hits
    state["tool_trace"].append("retriever")
    return state


def _run_repo_mapper(state: AgentState) -> AgentState:
    files = [hit.metadata.file_path for hit in state.get("hits", [])]
    ranked_files = [item[0] for item in Counter(files).most_common(12)]
    state["repo_map"] = ranked_files
    state["tool_trace"].append("repo_mapper")
    return state


def _run_codewiki(state: AgentState, adapter: CodeWikiMCPAdapter) -> AgentState:
    state["mcp_result"] = adapter.query(repo_url=state["repo_url"], question=state["query"])
    state["tool_trace"].append("codewiki_mcp")
    return state


def _context_text(state: AgentState) -> str:
    hit_blocks = []
    for hit in state.get("hits", [])[:8]:
        block = (
            f"File: {hit.metadata.file_path}:{hit.metadata.line_start}-{hit.metadata.line_end}\n"
            f"Symbol: {hit.metadata.symbol or 'n/a'}\n"
            f"{hit.content[:900]}"
        )
        hit_blocks.append(block)

    mcp_blocks = []
    mcp_result = state.get("mcp_result")
    if mcp_result and mcp_result.available:
        for insight in mcp_result.insights[:4]:
            mcp_blocks.append(f"[{insight.title}] {insight.content}")

    return "\n\n".join(hit_blocks + mcp_blocks)


def _run_file_explainer(state: AgentState, llm: LLMService) -> AgentState:
    intent = state.get("intent", "general")
    prompt = FLOW_PROMPT if intent == "flow" else COMPOSER_PROMPT
    ctx = _context_text(state)
    fallback = "No grounded context found yet for this question."
    answer = llm.generate(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=f"Query: {state['query']}\n\nContext:\n{ctx}\n\nTask:\n{prompt}",
        fallback=fallback,
    )
    state["answer_draft"] = answer
    state["tool_trace"].append("file_explainer")
    return state


def _valid_mermaid(text: str) -> bool:
    starters = ("flowchart", "graph", "sequenceDiagram", "classDiagram", "erDiagram")
    return text.strip().startswith(starters)


def _run_diagram_generator(state: AgentState, llm: LLMService) -> AgentState:
    ctx = _context_text(state)
    fallback = "flowchart TD\nA[Query] --> B[Retriever]\nB --> C[Answer]"
    candidate = llm.generate(
        system_prompt=MERMAID_PROMPT,
        user_prompt=f"Query: {state['query']}\n\nContext:\n{ctx}",
        fallback=fallback,
    ).strip()

    if not _valid_mermaid(candidate):
        candidate = llm.generate(
            system_prompt=MERMAID_REPAIR_PROMPT,
            user_prompt=f"Repair this Mermaid:\n{candidate}",
            fallback=fallback,
        ).strip()

    if not _valid_mermaid(candidate):
        candidate = fallback

    state["diagram"] = Diagram(type="mermaid", content=candidate)
    state["tool_trace"].append("diagram_generator")
    return state


def _run_notes_suggester(state: AgentState) -> AgentState:
    intent = state.get("intent", "general")
    if intent == "onboarding":
        suggestions = ["onboarding", "architecture", "key-modules"]
    elif intent == "flow":
        suggestions = ["auth-flow", "api-flow", "architecture"]
    else:
        suggestions = ["architecture", "onboarding", "key-modules"]

    state["notes_suggestions"] = suggestions
    state["tool_trace"].append("notes_generator")
    return state


def _compose_response(state: AgentState) -> AgentState:
    state["tool_trace"].append("compose_response")
    return state


def build_graph(vector_store: VectorStore, mcp_adapter: CodeWikiMCPAdapter, llm: LLMService, top_k: int):
    graph = StateGraph(AgentState)

    graph.add_node("classify_intent", _classify_intent)
    graph.add_node("run_retriever", lambda state: _run_retriever(state, vector_store, top_k))
    graph.add_node("run_repo_mapper", _run_repo_mapper)
    graph.add_node("run_codewiki_mcp", lambda state: _run_codewiki(state, mcp_adapter))
    graph.add_node("run_file_explainer", lambda state: _run_file_explainer(state, llm))
    graph.add_node("run_diagram_generator", lambda state: _run_diagram_generator(state, llm))
    graph.add_node("run_notes_generator", _run_notes_suggester)
    graph.add_node("compose_response", _compose_response)

    graph.add_edge(START, "classify_intent")
    graph.add_edge("classify_intent", "run_retriever")
    graph.add_edge("run_retriever", "run_repo_mapper")
    graph.add_edge("run_repo_mapper", "run_codewiki_mcp")
    graph.add_edge("run_codewiki_mcp", "run_file_explainer")
    graph.add_edge("run_file_explainer", "run_diagram_generator")
    graph.add_edge("run_diagram_generator", "run_notes_generator")
    graph.add_edge("run_notes_generator", "compose_response")
    graph.add_edge("compose_response", END)

    return graph.compile()
