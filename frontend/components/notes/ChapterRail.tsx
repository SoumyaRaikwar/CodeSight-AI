"use client";

import { motion } from "motion/react";

import { StudioPage } from "@/components/notes/types";

export function ChapterRail({ pages, currentIndex, onJump }: { pages: StudioPage[]; currentIndex: number; onJump: (idx: number) => void; }) {
  return (
    <aside className="rounded-3xl border border-border-subtle/60 bg-surface-1/50 p-3 backdrop-blur-sm">
      <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.22em] text-text-tertiary">Chapter Rail</p>
      <div className="custom-scroll max-h-[62vh] space-y-2 overflow-auto pr-1">
        {pages.map((page, idx) => (
          <motion.button
            key={page.id}
            onClick={() => onJump(idx)}
            whileHover={{ x: 2 }}
            className={`w-full rounded-xl px-3 py-2 text-left ${idx === currentIndex ? "bg-[var(--accent-soft)] text-text-primary" : "bg-surface-2/60 text-text-secondary"}`}
          >
            <p className="truncate text-[10px] uppercase tracking-[0.15em] text-text-tertiary">{page.chapter}</p>
            <p className="truncate text-sm">{page.title}</p>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
