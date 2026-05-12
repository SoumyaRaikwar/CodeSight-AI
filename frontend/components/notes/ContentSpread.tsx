"use client";

import ReactMarkdown from "react-markdown";

import { StudioPage } from "@/components/notes/types";

export function ContentSpread({ page }: { page: StudioPage }) {
  return (
    <div className="h-full rounded-[18px] bg-paper-soft p-7 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.85)]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Section</p>
          <h3 className="font-display text-2xl text-ink">{page.title}</h3>
        </div>
        <span className="rounded-full border border-paper-edge px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-muted">{page.chapter}</span>
      </div>
      <div className="custom-scroll prose max-h-[420px] overflow-auto pr-2 text-[14px] leading-6 prose-headings:font-display prose-headings:text-ink prose-p:text-ink-soft prose-li:text-ink-soft prose-code:rounded prose-code:bg-paper prose-code:px-1.5 prose-code:text-[12px]">
        <ReactMarkdown>{page.markdown}</ReactMarkdown>
      </div>
      <p className="mt-3 text-right text-xs text-ink-muted">{page.index + 1}</p>
    </div>
  );
}
