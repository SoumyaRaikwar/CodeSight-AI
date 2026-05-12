"use client";

import Link from "next/link";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

import { Note } from "@/types";

const NOTE_TYPES = ["onboarding", "architecture", "auth-flow", "api-flow", "key-modules"];

export function NotesPanel({ repoId, notes, loading, onGenerate }: { repoId: string; notes: Note[]; loading: boolean; onGenerate: (noteType: string) => Promise<void>; }) {
  return (
    <div className="glass rounded-3xl border border-border-subtle p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">Learning Notes</h4>
        <Link href={`/notes/${repoId}`} className="text-xs text-accent hover:text-accent-hover">
          Open Notes Studio
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {NOTE_TYPES.map((noteType) => (
          <motion.button whileTap={{ scale: 0.97 }} key={noteType} onClick={() => onGenerate(noteType)} disabled={loading} className="rounded-full border border-border-subtle px-3 py-1 text-xs text-text-secondary hover:border-[var(--accent-line)] disabled:opacity-50">
            {noteType}
          </motion.button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {notes.length === 0 && <p className="text-xs text-text-tertiary">Generate note sets, then open the studio reader.</p>}
        {notes.slice(0, 1).map((note) => (
          <article key={note.note_type} className="rounded-xl border border-border-subtle bg-surface-1 p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-accent">{note.note_type}</p>
            <div className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown>{note.content.slice(0, 320)}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
