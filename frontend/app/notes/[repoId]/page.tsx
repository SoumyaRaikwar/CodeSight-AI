"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AnimatedPageShell } from "@/components/motion/AnimatedPageShell";
import { NotesStudioShell } from "@/components/notes/NotesStudioShell";
import { getNotes, getRepo } from "@/lib/api";
import { Note, RepoMetadata } from "@/types";

const ORDER = ["onboarding", "architecture", "auth-flow", "api-flow", "key-modules"];

export default function NotesPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const [repo, setRepo] = useState<RepoMetadata | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeType, setActiveType] = useState<string>("onboarding");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getRepo(repoId), getNotes(repoId)])
      .then(([repoData, notesData]) => {
        setRepo(repoData);
        const sorted = [...notesData.notes].sort((a, b) => ORDER.indexOf(a.note_type) - ORDER.indexOf(b.note_type));
        setNotes(sorted);
        if (sorted.length) setActiveType(sorted[0].note_type);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load notes"))
      .finally(() => setLoading(false));
  }, [repoId]);

  const hasNotes = useMemo(() => notes.length > 0, [notes]);

  return (
    <AnimatedPageShell>
      {loading && (
        <div className="mx-auto max-w-[1400px] p-6">
          <LoadingSkeleton />
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-[1400px] p-6">
          <ErrorState title="Unable to open Notes Studio" description={error} />
        </div>
      )}

      {!loading && !error && !hasNotes && (
        <div className="mx-auto max-w-[1400px] p-6">
          <ErrorState
            title="No notes available yet"
            description="Generate onboarding/architecture notes in the workspace first, then return to Notes Studio."
          />
        </div>
      )}

      {!loading && !error && hasNotes && (
        <NotesStudioShell
          repo={repo}
          repoId={repoId}
          notes={notes}
          activeType={activeType}
          setActiveType={setActiveType}
        />
      )}
    </AnimatedPageShell>
  );
}
