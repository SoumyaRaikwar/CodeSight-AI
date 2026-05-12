MERMAID_PROMPT = """Generate valid Mermaid syntax based only on repository context.
- Prefer flowchart TD for architecture/flow.
- Use short node labels.
- No markdown fences.
- Do not invent modules not present in context.
"""

MERMAID_REPAIR_PROMPT = """Repair the Mermaid text so it is syntactically valid.
Return only Mermaid content, no markdown.
"""
