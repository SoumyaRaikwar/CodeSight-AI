# CodeSight AI: Viva & Presentation Q&A Study Guide

This guide contains potential questions and detailed answers for your minor project viva and presentation.

---

## 1. Project Overview & Motivation

**Q: What is the core problem CodeSight AI solves?**
**A:** CodeSight AI addresses the difficulty developers face when onboarding or exploring large, unfamiliar repositories. Traditional search is keyword-based; CodeSight AI provides a natural language interface that understands the *semantics* and *architecture* of the code using Agentic AI and RAG.

**Q: What are the key features of your application?**
**A:** 
- Semantically aware code retrieval (RAG).
- Agentic orchestration using LangGraph (multi-step reasoning).
- Automatic generation of Mermaid diagrams for architecture.
- 3D interactive "Notes" reader for onboarding.
- Integration with external repository intelligence via MCP (Model Context Protocol).

---

## 2. Technical Architecture

**Q: Explain your tech stack and why you chose it.**
**A:**
- **Backend (FastAPI):** High performance, asynchronous support, and excellent type safety with Pydantic.
- **Frontend (Next.js 14):** Modern React framework with Server Components and excellent routing/performance.
- **Database (ChromaDB):** An open-source vector database optimized for AI applications and fast semantic search.
- **Agentic Layer (LangGraph):** Allows for cyclic, stateful workflows which are better for complex code analysis than simple linear chains.

**Q: How does the "Repo Ingestion" pipeline work?**
**A:** 
1. The user provides a GitHub URL.
2. The backend clones the repository (GitPython).
3. Files are filtered (removing binaries, node_modules, etc.).
4. Code is chunked into logical blocks (functions/classes).
5. Chunks are converted into embeddings using `sentence-transformers`.
6. Embeddings are stored in ChromaDB.

---

## 3. Agentic AI & RAG

**Q: What is RAG, and how is it used here?**
**A:** Retrieval-Augmented Generation (RAG) is the process of retrieving relevant documents (code chunks) from a database and providing them as context to an LLM. This prevents "hallucinations" and ensures answers are grounded in the actual source code.

**Q: Why use LangGraph instead of a simple LangChain?**
**A:** Code exploration is rarely linear. An agent might need to retrieve code, realize it needs more context from a different module, and then loop back. LangGraph supports this "looping" (cycles) and maintains a persistent state of the conversation and findings.

**Q: What are the different "nodes" in your agent graph?**
**A:**
- `classify_intent`: Determines if the user wants an explanation, a diagram, or onboarding notes.
- `run_retriever`: Fetches code from ChromaDB.
- `run_repo_mapper`: Analyzes the high-level file structure.
- `run_diagram_generator`: Generates Mermaid code for visuals.
- `compose_response`: Finalizes the answer for the UI.

---

## 4. Advanced Integrations

**Q: What is MCP (Model Context Protocol)?**
**A:** MCP is a standard that allows AI agents to connect to external tools and data sources seamlessly. In this project, we use it to connect to "CodeWiki," providing external repository intelligence that isn't in the local clone.

**Q: How do you handle cases where the LLM might be wrong?**
**A:** We use "Grounded References." Every claim the AI makes is accompanied by the exact file path and line numbers retrieved from the vector store, allowing the user to verify the source.

---

## 5. Challenges & Future Scope

**Q: What were the biggest challenges you faced?**
**A:**
- **Context Window Limits:** Fitting large chunks of code into the LLM prompt.
- **Chunking Strategy:** Ensuring that functions aren't cut in half, which would lose semantic meaning.
- **Performance:** Making the ingestion of large repositories fast enough for a good UX.

**Q: How would you scale this for production?**
**A:**
- Use a distributed vector store (like Pinecone or Weaviate).
- Implement background workers (Celery/Redis) for repository ingestion.
- Add user authentication and workspace persistence.
- Implement streaming (SSE) for chat responses.

---

## 6. Premium UI/UX

**Q: Why did you include a 3D Notes reader?**
**A:** Onboarding is often boring. The 3D reader (using Three.js/Framer Motion) provides a "premium" feel and makes reading structured architecture notes more engaging, improving information retention.

---

## Final Quick-Fire Tips:
- **Be clear about "Local RAG":** Emphasize that the code is indexed locally.
- **Mention "Agentic":** This is a hot topic. Explain that the AI *thinks* about the steps it needs to take.
- **Refer to the Makefile:** It shows your project is professional and reproducible.
