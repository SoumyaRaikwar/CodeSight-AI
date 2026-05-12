export type RepoTreeNode = { path: string; kind: "file" | "dir" };

export type RepoMetadata = {
  repo_id: string;
  repo_url: string;
  repo_name: string;
  local_path: string;
  status: "pending" | "indexed" | "failed";
  summary: string;
  tree_preview: RepoTreeNode[];
  indexed_files: number;
};

export type Reference = {
  file_path: string;
  symbol?: string | null;
  line_start: number;
  line_end: number;
  reason: string;
};

export type Diagram = {
  type: "mermaid";
  content: string;
};

export type ChatResponse = {
  answer: string;
  references: Reference[];
  diagram?: Diagram | null;
  tool_trace: string[];
  notes_suggestions: string[];
};

export type Note = {
  repo_id: string;
  note_type: string;
  content: string;
  generated_at: string;
};
