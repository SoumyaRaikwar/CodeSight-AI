"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpenText, LayoutDashboard, ListChecks, Sparkles } from "lucide-react";

import { AnswerCard } from "@/components/AnswerCard";
import { ChatPanel, Message } from "@/components/ChatPanel";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MermaidPanel } from "@/components/MermaidPanel";
import { NotesPanel } from "@/components/NotesPanel";
import { ReferencesPanel } from "@/components/ReferencesPanel";
import { RepoStatusCard } from "@/components/RepoStatusCard";
import { RepoTreePanel } from "@/components/RepoTreePanel";
import { ToolTraceBadgeList } from "@/components/ToolTraceBadgeList";
import { AnimatedPageShell } from "@/components/motion/AnimatedPageShell";
import { useLocalHistory } from "@/hooks/use-local-history";
import { askQuestion, generateNote, getNotes, getRepo } from "@/lib/api";
import { ChatResponse, Note, RepoMetadata } from "@/types";

const TABS = ["diagram", "references", "trace"] as const;
type SideTab = (typeof TABS)[number];

export default function WorkspacePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;
  const [repo, setRepo] = useState<RepoMetadata | null>(null);
  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<SideTab>("diagram");
  const { items: history, addItem } = useLocalHistory(`codesight-history-${repoId}`);

  useEffect(() => {
    getRepo(repoId)
      .then(setRepo)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load repository"))
      .finally(() => setLoadingRepo(false));

    getNotes(repoId)
      .then((data) => setNotes(data.notes))
      .catch(() => undefined);
  }, [repoId]);

  const onAsk = async (question: string) => {
    setLoadingChat(true);
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    addItem(question);
    try {
      const res = await askQuestion(repoId, question);
      setChat(res);
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setLoadingChat(false);
    }
  };

  const onGenerateNote = async (noteType: string) => {
    setLoadingNotes(true);
    try {
      const note = await generateNote(repoId, noteType);
      setNotes((prev) => [note, ...prev.filter((n) => n.note_type !== noteType)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate note");
    } finally {
      setLoadingNotes(false);
    }
  };

  const rightPanel = useMemo(() => {
    if (tab === "diagram") return <MermaidPanel content={chat?.diagram?.content} />;
    if (tab === "references") return <ReferencesPanel references={chat?.references || []} />;
    return (
      <div className="glass rounded-3xl border border-border-subtle p-4">
        <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">Tool Trace</h4>
        <div className="mt-3">
          <ToolTraceBadgeList tools={chat?.tool_trace || []} />
        </div>
      </div>
    );
  }, [chat, tab]);

  return (
    <AnimatedPageShell>
      <div className="mx-auto grid min-h-screen max-w-[1700px] grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr_380px]">
        <aside className="space-y-4">
          <div className="glass rounded-3xl border border-border-subtle p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-text-primary">Repository</h3>
              <Link href="/" className="text-xs text-text-tertiary hover:text-accent">new ingest</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-text-tertiary">
              <div className="rounded-xl border border-border-subtle p-2"><LayoutDashboard size={14} className="mb-1 text-accent" />Workspace</div>
              <div className="rounded-xl border border-border-subtle p-2"><BookOpenText size={14} className="mb-1 text-text-secondary" />Notes</div>
              <div className="rounded-xl border border-border-subtle p-2"><Sparkles size={14} className="mb-1 text-success" />Trace</div>
            </div>
          </div>
          {loadingRepo && <LoadingSkeleton />}
          {repo && <RepoStatusCard repo={repo} />}
          <RepoTreePanel nodes={repo?.tree_preview || []} />
          <NotesPanel repoId={repoId} notes={notes} loading={loadingNotes} onGenerate={onGenerateNote} />
        </aside>

        <section className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <ChatPanel messages={messages} onAsk={onAsk} loading={loadingChat} />
          {chat ? <AnswerCard answer={chat.answer} /> : <LoadingSkeleton />}
          <div className="glass rounded-3xl border border-border-subtle p-4">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks size={16} className="text-accent" />
              <h4 className="font-display text-xs uppercase tracking-[0.2em] text-text-tertiary">Recent Questions</h4>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {history.length === 0 && <p className="text-xs text-text-tertiary">No recent prompts.</p>}
              {history.map((q) => (
                <motion.button key={q} whileTap={{ scale: 0.98 }} onClick={() => onAsk(q)} className="rounded-full border border-border-subtle bg-surface-1 px-3 py-1 text-xs text-text-secondary hover:border-[var(--accent-line)]">
                  {q.slice(0, 56)}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass rounded-3xl border border-border-subtle p-2">
            <div className="relative flex">
              {TABS.map((item) => (
                <button key={item} onClick={() => setTab(item)} className="relative z-10 flex-1 rounded-xl px-3 py-2 text-xs uppercase tracking-[0.15em] text-text-secondary">
                  {item}
                </button>
              ))}
              <motion.div layout transition={{ duration: 0.26 }} className="absolute top-1 h-9 rounded-xl bg-[var(--accent-soft)]" style={{ width: "33.3%", left: tab === "diagram" ? "0%" : tab === "references" ? "33.3%" : "66.6%" }} />
            </div>
          </div>
          {rightPanel}
        </aside>
      </div>
    </AnimatedPageShell>
  );
}
