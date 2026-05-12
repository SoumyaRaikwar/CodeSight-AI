"use client";

import { StudioPage, ViewMode } from "@/components/notes/types";

export function ReadingMetaPanel({ currentPage, total, generatedAt, viewMode, zoom }: { currentPage?: StudioPage; total: number; generatedAt?: string; viewMode: ViewMode; zoom: number; }) {
  return (
    <aside className="rounded-3xl border border-border-subtle/60 bg-surface-1/50 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.22em] text-text-tertiary">Reading Meta</p>
      <div className="mt-3 space-y-2 text-sm text-text-secondary">
        <p>Page: {currentPage ? currentPage.index + 1 : 0}/{Math.max(total, 1)}</p>
        <p>Template: {currentPage?.template || "n/a"}</p>
        <p>View: {viewMode}</p>
        <p>Zoom: {zoom.toFixed(2)}x</p>
      </div>
      <div className="mt-4 rounded-xl bg-surface-2/80 p-3 text-xs text-text-secondary">
        <p className="font-medium text-accent">Shortcuts</p>
        <p>← / →: turn spread</p>
        <p>M: Studio / Focus</p>
        <p>R: reset view</p>
      </div>
      <p className="mt-4 text-xs text-text-tertiary">{generatedAt ? new Date(generatedAt).toLocaleString() : ""}</p>
    </aside>
  );
}
