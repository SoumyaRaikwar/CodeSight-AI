"use client";

import { useEffect, useMemo, useState } from "react";

import { ChapterRail } from "@/components/notes/ChapterRail";
import { FocusModeViewer } from "@/components/notes/FocusModeViewer";
import { NotesControls } from "@/components/notes/NotesControls";
import { ReadingMetaPanel } from "@/components/notes/ReadingMetaPanel";
import { NotesStage } from "@/components/notes/NotesStage";
import { NotesTopBar } from "@/components/notes/NotesTopBar";
import { usePageTurnController } from "@/components/notes/PageTurnController";
import { ReadingMode, StudioPage, ViewMode } from "@/components/notes/types";
import { Note, RepoMetadata } from "@/types";

function inferTemplate(noteType: string, text: string, idx: number): StudioPage["template"] {
  const lower = text.toLowerCase();
  if (idx === 0) return "chapter-opener";
  if (lower.includes("```") || lower.includes("function") || lower.includes("class ")) return "code";
  if (lower.includes("diagram") || lower.includes("architecture") || lower.includes("flow")) return "diagram";
  if (lower.includes("checklist") || lower.includes("steps") || /(^|\n)-\s/.test(text)) return "checklist";
  if (noteType === "key-modules") return "modules";
  return "standard";
}

export function NotesStudioShell({
  repo,
  repoId,
  notes,
  activeType,
  setActiveType,
}: {
  repo: RepoMetadata | null;
  repoId: string;
  notes: Note[];
  activeType: string;
  setActiveType: (v: string) => void;
}) {
  const activeNote = notes.find((n) => n.note_type === activeType);
  const pages = useMemo<StudioPage[]>(() => {
    if (!activeNote) return [];
    const chunks = activeNote.content
      .split(/\n(?=#|##|### )|\n\n+/g)
      .map((s) => s.trim())
      .filter(Boolean);

    return chunks.map((chunk, idx) => {
      const heading = chunk.match(/^#{1,3}\s+(.+)/m)?.[1] || `${activeNote.note_type} • ${idx + 1}`;
      const summary = chunk.replace(/[#*`>-]/g, "").slice(0, 180);
      return {
        id: `${activeNote.note_type}-${idx}`,
        title: heading,
        chapter: activeNote.note_type,
        markdown: chunk,
        index: idx,
        template: inferTemplate(activeNote.note_type, chunk, idx),
        summary,
      };
    });
  }, [activeNote]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [camMode, setCamMode] = useState<ReadingMode>("reading");
  const [viewMode, setViewMode] = useState<ViewMode>("studio");
  const [zoom, setZoom] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeType]);

  const commitTurn = (direction: "next" | "prev") => {
    setCurrentIndex((prev) => {
      if (direction === "next") return Math.min(prev + 2, Math.max(pages.length - 1, 0));
      return Math.max(prev - 2, 0);
    });
  };

  const { turnDirection, turnProgress, triggerTurn } = usePageTurnController(commitTurn);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") triggerTurn("next");
      if (event.key === "ArrowLeft") triggerTurn("prev");
      if (event.key.toLowerCase() === "r") {
        setZoom(1);
        setResetSignal((v) => v + 1);
      }
      if (event.key.toLowerCase() === "m") setViewMode((m) => (m === "studio" ? "focus" : "studio"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerTurn]);

  const leftPage = pages[currentIndex];
  const rightPage = pages[currentIndex + 1];

  return (
    <div className="mx-auto max-w-[1880px] p-4">
      <NotesTopBar
        repo={repo}
        repoId={repoId}
        activeType={activeType}
        setActiveType={setActiveType}
        notes={notes}
        activeNote={activeNote}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((m) => (m === "studio" ? "focus" : "studio"))}
      />

      <div className={`grid gap-4 ${viewMode === "studio" ? "lg:grid-cols-[240px_1fr_250px]" : "lg:grid-cols-[220px_1fr]"}`}>
        <ChapterRail pages={pages} currentIndex={currentIndex} onJump={(idx) => setCurrentIndex(idx)} />

        <section className="space-y-3">
          {viewMode === "studio" ? (
            <NotesStage
              leftPage={leftPage}
              rightPage={rightPage}
              turnProgress={turnProgress}
              turnDirection={turnDirection}
              mode={camMode}
              zoom={zoom}
              resetSignal={resetSignal}
            />
          ) : (
            <FocusModeViewer page={leftPage} />
          )}

          <NotesControls
            onPrev={() => triggerTurn("prev")}
            onNext={() => triggerTurn("next")}
            onZoomIn={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            onZoomOut={() => setZoom((z) => Math.max(0.78, z - 0.1))}
            onReset={() => {
              setZoom(1);
              setResetSignal((v) => v + 1);
            }}
            mode={camMode}
            onToggleMode={() => setCamMode((m) => (m === "reading" ? "explore" : "reading"))}
          />
        </section>

        {viewMode === "studio" && (
          <ReadingMetaPanel
            currentPage={leftPage}
            total={pages.length}
            generatedAt={activeNote?.generated_at}
            viewMode={viewMode}
            zoom={zoom}
          />
        )}
      </div>
    </div>
  );
}
