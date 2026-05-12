import { GitBranch, FolderTree, ShieldCheck } from "lucide-react";

import { RepoMetadata } from "@/types";

export function RepoStatusCard({ repo }: { repo: RepoMetadata }) {
  return (
    <div className="glass rounded-3xl border border-border-subtle p-4 shadow-panel">
      <h3 className="font-display text-lg text-text-primary">{repo.repo_name || "Repository"}</h3>
      <p className="mt-2 text-sm text-text-secondary">{repo.summary}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-text-tertiary">
        <div className="rounded-xl border border-border-subtle p-2">
          <GitBranch size={14} className="mb-1 text-accent" />
          {repo.status}
        </div>
        <div className="rounded-xl border border-border-subtle p-2">
          <FolderTree size={14} className="mb-1 text-text-secondary" />
          {repo.indexed_files} files
        </div>
        <div className="rounded-xl border border-border-subtle p-2">
          <ShieldCheck size={14} className="mb-1 text-success" />
          grounded
        </div>
      </div>
    </div>
  );
}
