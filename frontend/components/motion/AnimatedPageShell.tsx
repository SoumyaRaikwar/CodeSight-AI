"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { transitions, variants } from "@/lib/motion";

export function AnimatedPageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants.page}
      transition={transitions.page}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}
