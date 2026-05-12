"use client";

import { motion } from "motion/react";

export function FlowPreview() {
  return (
    <div className="mt-14 grid-fade overflow-hidden rounded-3xl border border-border-subtle bg-surface-2/70 p-6 shadow-panel">
      <div className="relative z-10 grid gap-4 md:grid-cols-4">
        {[
          "Repo URL",
          "Ingestion + Embeddings",
          "Agent + MCP",
          "Answer + Diagram",
        ].map((item, idx) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.12 }}
            className="rounded-xl2 border border-border-subtle bg-surface-1/70 p-4"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-accent">{idx + 1}</p>
            <p className="mt-2 font-medium text-text-primary">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
