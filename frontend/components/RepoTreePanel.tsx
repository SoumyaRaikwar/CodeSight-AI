"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { RepoTreeNode } from "@/types";

export function RepoTreePanel({ nodes }: { nodes: RepoTreeNode[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass rounded-3xl border border-border-subtle p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between">
        <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">Repo Tree</h4>
        <ChevronDown size={15} className={open ? "rotate-180" : ""} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="custom-scroll mt-3 max-h-56 overflow-auto text-xs">
              {nodes.length === 0 ? (
                <p className="text-text-tertiary">No files indexed yet.</p>
              ) : (
                <ul className="space-y-1">
                  {nodes.map((node) => (
                    <li key={`${node.kind}-${node.path}`} className="truncate rounded-lg border border-transparent px-2 py-1 text-text-secondary hover:border-border-subtle hover:bg-surface-1">
                      <span className="mr-2 text-text-tertiary">{node.kind === "dir" ? "d" : "f"}</span>
                      {node.path}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
