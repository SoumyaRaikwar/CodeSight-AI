"use client";

import { StudioPage } from "@/components/notes/types";

export function ChecklistSpread({ page }: { page: StudioPage }) {
  const items = page.markdown
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="h-full rounded-[18px] bg-paper-soft p-7 text-ink">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Onboarding Checklist</p>
      <h3 className="mt-1 font-display text-2xl">{page.title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item, idx) => (
          <li key={item + idx} className="flex items-start gap-2 rounded-lg border border-paper-edge bg-paper p-2 text-sm text-ink-soft">
            <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-paper-edge text-[10px]">{idx + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-xs text-ink-muted">{page.index + 1}</p>
    </div>
  );
}
