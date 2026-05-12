"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function ChatMessage({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-3 text-sm shadow-soft",
        role === "user"
          ? "ml-12 border-[var(--accent-line)] bg-[var(--accent-soft)]"
          : "mr-12 border-border-subtle bg-surface-2"
      )}
    >
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-text-tertiary">{role}</p>
      <p className="whitespace-pre-wrap text-text-primary">{text}</p>
    </motion.div>
  );
}
