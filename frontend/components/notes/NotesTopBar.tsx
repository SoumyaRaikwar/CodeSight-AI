"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

import { ViewMode } from "@/components/notes/types";
import { Note, RepoMetadata } from "@/types";

export function NotesTopBar({
  repo,
  repoId,
  activeType,
  setActiveType,
  notes,
  activeNote,
  viewMode,
  onToggleViewMode,
}: {
  repo: RepoMetadata | null;
  repoId: string;
  activeType: string;
  setActiveType: (v: string) => void;
  notes: Note[];
  activeNote?: Note;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}) {
  return (
    <div className="mb-3 rounded-3xl border border-border-subtle bg-surface-1/90 p-4 backdrop-blur-md shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent">Notes Studio</p>
          <h1 className="font-display text-3xl text-text-primary">{repo?.repo_name || repoId}</h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.98 }} onClick={onToggleViewMode} className="rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-accent">
            {viewMode === "studio" ? "Focus Mode" : "Studio Mode"}
          </motion.button>
          <Link href={`/workspace/${repoId}`} className="inline-flex items-center gap-1 rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-secondary">
            Back <ExternalLink size={13} />
          </Link>
          {activeNote && (
            <a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(activeNote.content)}`} download={`${repoId}-${activeNote.note_type}.md`} className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-ink">
              <Download size={14} /> Export
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {notes.map((note) => (
          <motion.button whileTap={{ scale: 0.98 }} key={note.note_type} onClick={() => setActiveType(note.note_type)} className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] ${activeType === note.note_type ? "bg-[var(--accent-soft)] text-accent" : "bg-surface-2 text-text-secondary"}`}>
            {note.note_type}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
