"use client";

import { Code2, Compass, Network, Sparkles } from "lucide-react";

import { AnimatedSection } from "@/components/motion/AnimatedSection";

const FEATURES = [
  { icon: Network, title: "Agentic Orchestration", desc: "LangGraph-driven tool routing with transparent trace." },
  { icon: Code2, title: "Grounded Answers", desc: "File and line references for every explanation." },
  { icon: Compass, title: "Onboarding Acceleration", desc: "Generate structured learning notes and mental models." },
  { icon: Sparkles, title: "Mermaid Visuals", desc: "Architecture and flow diagrams generated from live context." },
];

export function FeatureRail() {
  return (
    <AnimatedSection className="mt-16 grid gap-4 md:grid-cols-2">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="glass rounded-2xl border border-border-subtle p-5">
          <feature.icon className="text-accent" size={20} />
          <h3 className="mt-3 font-display text-xl text-text-primary">{feature.title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{feature.desc}</p>
        </div>
      ))}
    </AnimatedSection>
  );
}
