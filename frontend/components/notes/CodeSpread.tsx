"use client";

import { StudioPage } from "@/components/notes/types";

export function CodeSpread({ page }: { page: StudioPage }) {
  const snippet = page.markdown.split("\n").slice(0, 12).join("\n");

  return (
    <div className="h-full rounded-[18px] bg-paper-soft p-7 text-ink">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Code Insight</p>
      <h3 className="mt-1 font-display text-2xl">{page.title}</h3>
      <pre className="custom-scroll mt-4 max-h-[250px] overflow-auto rounded-xl border border-paper-edge bg-paper p-4 text-[12px] leading-5 text-ink-soft">
{snippet}
      </pre>
      <p className="mt-4 text-sm leading-6 text-ink-soft">Annotations focus on why this block matters and what to inspect next.</p>
      <p className="mt-4 text-right text-xs text-ink-muted">{page.index + 1}</p>
    </div>
  );
}
