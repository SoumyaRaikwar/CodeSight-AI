"use client";

import { motion } from "motion/react";

import { Reference } from "@/types";

export function ReferencesPanel({ references }: { references: Reference[] }) {
  return (
    <div className="glass rounded-3xl border border-border-subtle p-4">
      <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">References</h4>
      <div className="custom-scroll mt-3 max-h-[420px] space-y-2 overflow-auto pr-1 text-xs">
        {references.length === 0 && <p className="text-text-tertiary">No references available.</p>}
        {references.map((ref, idx) => (
          <motion.div key={`${ref.file_path}-${idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border-subtle bg-surface-1 p-2">
            <p className="truncate font-medium text-text-primary">{ref.file_path}</p>
            <p className="mt-1 text-text-tertiary">lines {ref.line_start}-{ref.line_end} {ref.symbol ? `• ${ref.symbol}` : ""}</p>
            <p className="mt-1 text-text-secondary">{ref.reason}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
