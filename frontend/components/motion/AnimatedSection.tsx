"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { transitions, variants } from "@/lib/motion";

export function AnimatedSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants.section}
      transition={transitions.page}
      className={className}
    >
      {children}
    </motion.section>
  );
}
