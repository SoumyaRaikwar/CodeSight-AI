import { ChatResponse, Note, RepoMetadata, RepoTreeNode } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function ingestRepo(repoUrl: string): Promise<{
  repo_id: string;
  status: string;
  repo_name: string;
  summary: string;
  tree_preview: RepoTreeNode[];
}> {
  const response = await fetch(`${API_BASE}/api/repos/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getRepo(repoId: string): Promise<RepoMetadata> {
  const response = await fetch(`${API_BASE}/api/repos/${repoId}`, { cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function askQuestion(repoId: string, query: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_id: repoId, query }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function generateNote(repoId: string, noteType: string): Promise<Note> {
  const response = await fetch(`${API_BASE}/api/notes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_id: repoId, note_type: noteType }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getNotes(repoId: string): Promise<{ repo_id: string; notes: Note[] }> {
  const response = await fetch(`${API_BASE}/api/notes/${repoId}`, { cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
