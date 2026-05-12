"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import mermaid from "mermaid";
import { Check, ChevronDown, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

mermaid.initialize({ startOnLoad: false, theme: "dark" });

export function MermaidPanel({ content }: { content?: string | null }) {
  const [svg, setSvg] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const elementId = useMemo(() => `mmd-${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    if (!content) {
      setSvg("");
      return;
    }

    mermaid.render(elementId, content).then((result) => setSvg(result.svg)).catch(() => setSvg(""));
  }, [content, elementId]);

  const onCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="glass rounded-3xl border border-border-subtle p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">Diagram Viewer</h4>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onCopy} className="inline-flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1 text-xs text-text-secondary">
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        {svg ? (
          <motion.div key={content} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mermaid custom-scroll overflow-auto rounded-2xl border border-border-subtle bg-surface-1 p-3" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
            Diagram appears here after a grounded answer.
          </motion.p>
        )}
      </AnimatePresence>

      <Collapsible.Root open={open} onOpenChange={setOpen} className="mt-3">
        <Collapsible.Trigger className="inline-flex items-center gap-1 text-xs text-text-tertiary">
          <ChevronDown size={12} className={open ? "rotate-180" : ""} />
          Raw Mermaid
        </Collapsible.Trigger>
        <Collapsible.Content>
          <pre className="custom-scroll mt-2 max-h-52 overflow-auto rounded-xl border border-border-subtle bg-surface-1 p-3 text-xs text-text-secondary">
            {content || ""}
          </pre>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
