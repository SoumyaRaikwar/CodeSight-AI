"use client";

import { motion } from "motion/react";

import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { variants } from "@/lib/motion";

const STEPS = [
  { title: "Ingest", desc: "Clone and index repository files with code-aware chunking." },
  { title: "Reason", desc: "Agent graph routes retriever, repo mapper, and MCP context." },
  { title: "Explain", desc: "Get grounded answers, references, diagrams, and learning notes." },
];

export function HowItWorks() {
  return (
    <AnimatedSection className="mt-16">
      <h2 className="font-display text-3xl sm:text-4xl text-text-primary">How It Works</h2>
      <motion.div
        variants={variants.stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mt-8 grid gap-4 md:grid-cols-3"
      >
        {STEPS.map((step, idx) => (
          <motion.article
            key={step.title}
            variants={variants.staggerChild}
            whileHover={{ y: -5 }}
            className="glass rounded-2xl border border-border-subtle p-5 shadow-soft"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Step {idx + 1}</p>
            <h3 className="mt-2 font-display text-2xl text-text-primary">{step.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{step.desc}</p>
          </motion.article>
        ))}
      </motion.div>
    </AnimatedSection>
  );
}
