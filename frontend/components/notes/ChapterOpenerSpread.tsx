"use client";

import { StudioPage } from "@/components/notes/types";

export function ChapterOpenerSpread({ page }: { page: StudioPage }) {
  return (
    <div className="h-full rounded-[18px] bg-paper-soft p-8 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.75)]">
      <p className="text-[11px] uppercase tracking-[0.26em] text-ink-muted">{page.chapter}</p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-ink">{page.title}</h2>
      <p className="mt-4 max-w-[86%] text-base leading-7 text-ink-soft">{page.summary || "A guided technical chapter with practical context and clear file-grounded notes."}</p>
      <div className="mt-10 rounded-2xl border border-paper-edge bg-paper p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">Field Note</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">Use this section as your orientation spread before deep reading.</p>
      </div>
      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ink-muted">Page {page.index + 1}</p>
    </div>
  );
}
