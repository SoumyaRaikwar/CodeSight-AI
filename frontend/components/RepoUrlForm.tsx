"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import { motion } from "motion/react";

import { Input } from "@/components/ui/input";

export function RepoUrlForm({ onSubmit, loading }: { onSubmit: (url: string) => Promise<void>; loading: boolean }) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    await onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Github size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="h-14 rounded-2xl border-border-subtle bg-surface-1 pl-11 text-sm"
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={loading}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-6 font-semibold text-ink shadow-panel transition hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Indexing..." : "Ingest & Explore"}
        <ArrowRight size={16} />
      </motion.button>
    </form>
  );
}
