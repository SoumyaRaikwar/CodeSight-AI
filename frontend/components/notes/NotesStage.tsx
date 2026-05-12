"use client";

import { AnimatePresence, motion } from "motion/react";

import { BookScene } from "@/components/notes/BookScene";
import { NOTE_COLORS } from "@/components/notes/palette";
import { SpreadTemplateRenderer } from "@/components/notes/SpreadTemplateRenderer";
import { StudioPage } from "@/components/notes/types";

export function NotesStage({ leftPage, rightPage, turnProgress, turnDirection, mode, zoom, resetSignal }: { leftPage?: StudioPage; rightPage?: StudioPage; turnProgress: number; turnDirection: "next" | "prev" | null; mode: "reading" | "explore"; zoom: number; resetSignal: number; }) {
  return (
    <section className="relative h-[74vh] min-h-[760px] overflow-hidden rounded-[2.1rem] border border-border-subtle bg-bg-elevated shadow-[0_35px_95px_var(--shadow-deep)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(94,234,212,.08),transparent_42%)]" />
      <BookScene turnProgress={turnProgress} turnDirection={turnDirection} mode={mode} zoom={zoom} resetSignal={resetSignal} />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="grid w-[88%] max-w-[1320px] grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            <motion.div key={leftPage?.id || "left-empty"} initial={{ opacity: 0.92 }} animate={{ opacity: 1 }} exit={{ opacity: 0.9 }} className="pointer-events-auto h-[560px] rounded-[22px] border border-paper-edge/45 bg-paper-soft p-4 shadow-[0_28px_70px_var(--shadow-soft)]">
              <SpreadTemplateRenderer page={leftPage} />
            </motion.div>
            <motion.div key={rightPage?.id || "right-empty"} initial={{ opacity: 0.92 }} animate={{ opacity: 1 }} exit={{ opacity: 0.9 }} className="pointer-events-auto h-[560px] rounded-[22px] border border-paper-edge/45 bg-paper-soft p-4 shadow-[0_28px_70px_var(--shadow-soft)]">
              <SpreadTemplateRenderer page={rightPage} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[580px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,.35)]" style={{ background: `linear-gradient(to bottom, ${NOTE_COLORS.seamA}a6, ${NOTE_COLORS.seamB}cc, ${NOTE_COLORS.seamA}a0)` }} />
    </section>
  );
}
