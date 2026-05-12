"use client";

import { motion } from "motion/react";

export function ToolTraceBadgeList({ tools }: { tools: string[] }) {
  return (
    <div className="space-y-2">
      {tools.map((tool, idx) => (
        <motion.div
          key={tool + idx}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="rounded-xl border border-border-subtle bg-surface-1 px-2 py-1 text-xs text-text-secondary"
        >
          {tool}
        </motion.div>
      ))}
    </div>
  );
}
