"use client";

import { StudioPage } from "@/components/notes/types";

export function DiagramSpread({ page }: { page: StudioPage }) {
  return (
    <div className="h-full rounded-[18px] bg-paper-soft p-7 text-ink">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Architecture Lens</p>
      <h3 className="mt-1 font-display text-2xl">{page.title}</h3>
      <div className="mt-4 rounded-2xl border border-paper-edge bg-paper p-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-paper-edge p-2">Entry Points</div>
          <div className="rounded-lg border border-paper-edge p-2">Core Modules</div>
          <div className="rounded-lg border border-paper-edge p-2">Data Flow</div>
          <div className="rounded-lg border border-paper-edge p-2">Dependencies</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-soft">{page.summary || page.markdown.slice(0, 260)}</p>
      <p className="mt-4 text-right text-xs text-ink-muted">{page.index + 1}</p>
    </div>
  );
}
