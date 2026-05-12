"use client";

import { Compass, Search, SearchX, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { ReadingMode } from "@/components/notes/types";

function Btn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-secondary hover:border-[var(--accent-line)]">
      {children} {label}
    </motion.button>
  );
}

export function NotesControls({ onPrev, onNext, onZoomIn, onZoomOut, onReset, mode, onToggleMode }: { onPrev: () => void; onNext: () => void; onZoomIn: () => void; onZoomOut: () => void; onReset: () => void; mode: ReadingMode; onToggleMode: () => void; }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface-1/80 p-2 backdrop-blur-sm">
      <Btn onClick={onPrev} label="Prev">◀</Btn>
      <Btn onClick={onNext} label="Next">▶</Btn>
      <Btn onClick={onZoomIn} label="Zoom In"><Search size={15} /></Btn>
      <Btn onClick={onZoomOut} label="Zoom Out"><SearchX size={15} /></Btn>
      <Btn onClick={onReset} label="Reset"><Undo2 size={15} /></Btn>
      <Btn onClick={onToggleMode} label={mode === "reading" ? "Reading Cam" : "Explore Cam"}><Compass size={15} /></Btn>
    </div>
  );
}
