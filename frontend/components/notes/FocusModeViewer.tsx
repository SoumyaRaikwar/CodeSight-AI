"use client";

import { AnimatePresence, motion } from "motion/react";

import { SpreadTemplateRenderer } from "@/components/notes/SpreadTemplateRenderer";
import { StudioPage } from "@/components/notes/types";

export function FocusModeViewer({
  page,
}: {
  page?: StudioPage;
}) {
  return (
    <section className="relative h-[78vh] min-h-[760px] overflow-hidden rounded-[2rem] border border-border-subtle bg-bg-elevated p-6 shadow-[0_40px_100px_var(--shadow-deep)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(94,234,212,.05),transparent_55%)]" />
      <AnimatePresence mode="wait">
        <motion.div
          key={page?.id || "focus-empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative z-10 mx-auto h-full w-[min(1040px,94%)] rounded-[26px] border border-paper-edge bg-paper-soft p-6 shadow-[0_40px_120px_var(--shadow-soft)]"
        >
          <SpreadTemplateRenderer page={page} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
