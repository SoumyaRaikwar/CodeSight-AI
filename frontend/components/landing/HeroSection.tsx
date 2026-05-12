"use client";

import { motion } from "motion/react";

import { RepoUrlForm } from "@/components/RepoUrlForm";

export function HeroSection({
  onSubmit,
  loading,
}: {
  onSubmit: (url: string) => Promise<void>;
  loading: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-surface-2/80 p-8 shadow-panel sm:p-12">
      <motion.div
        className="absolute -left-16 -top-12 h-56 w-56 rounded-full bg-[var(--accent-soft)] blur-3xl"
        animate={{ x: [0, 12, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <p className="inline-flex rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
          Agentic Code Intelligence
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[1.03] sm:text-7xl text-text-primary">
          Understand any codebase with
          <motion.span
            className="ml-3 inline-block text-accent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            cinematic clarity.
          </motion.span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-text-secondary sm:text-lg">
          CodeSight AI maps architecture, traces flows, generates diagrams, and writes onboarding notes
          from your repository with grounded file references and agentic tool orchestration.
        </p>
        <RepoUrlForm onSubmit={onSubmit} loading={loading} />
      </div>
    </section>
  );
}
