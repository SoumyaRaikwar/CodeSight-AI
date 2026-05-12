"use client";

import { FormEvent, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { motion } from "motion/react";

import { ChatMessage } from "@/components/ChatMessage";
import { Input } from "@/components/ui/input";

export type Message = { role: "user" | "assistant"; text: string };

export function ChatPanel({ messages, onAsk, loading }: { messages: Message[]; onAsk: (question: string) => Promise<void>; loading: boolean }) {
  const [question, setQuestion] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    await onAsk(question.trim());
    setQuestion("");
  };

  return (
    <div className="glass rounded-3xl border border-border-subtle p-5 shadow-panel">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg text-text-primary">Workspace Chat</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-text-tertiary">grounded mode</span>
      </div>
      <div className="custom-scroll mt-3 max-h-[420px] space-y-3 overflow-auto pr-2">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-subtle p-4 text-sm text-text-tertiary">
            Ask architecture, auth-flow, API-flow, or module questions.
          </p>
        ) : (
          messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} role={message.role} text={message.text} />)
        )}
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} className="h-12 flex-1 rounded-2xl" placeholder="Trace auth middleware path and show related files" />
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={loading} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-4 font-semibold text-ink disabled:opacity-50">
          {loading ? "Thinking" : "Send"}
          <SendHorizonal size={15} />
        </motion.button>
      </form>
    </div>
  );
}
