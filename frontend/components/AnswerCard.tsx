"use client";

import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export function AnswerCard({ answer }: { answer: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl border border-border-subtle p-5 shadow-panel">
      <h4 className="font-display text-xs uppercase tracking-[0.2em] text-accent">Answer</h4>
      <div className="prose prose-invert mt-3 max-w-none prose-headings:font-display prose-p:my-2">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{answer}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
