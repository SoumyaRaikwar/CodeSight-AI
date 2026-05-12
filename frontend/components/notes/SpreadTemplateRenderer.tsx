"use client";

import { ChapterOpenerSpread } from "@/components/notes/ChapterOpenerSpread";
import { ChecklistSpread } from "@/components/notes/ChecklistSpread";
import { CodeSpread } from "@/components/notes/CodeSpread";
import { ContentSpread } from "@/components/notes/ContentSpread";
import { DiagramSpread } from "@/components/notes/DiagramSpread";
import { StudioPage } from "@/components/notes/types";

export function SpreadTemplateRenderer({ page }: { page?: StudioPage }) {
  if (!page) {
    return (
      <div className="h-full rounded-[18px] border border-paper-edge bg-paper-soft p-6 text-sm text-ink-muted">
        Blank spread
      </div>
    );
  }

  switch (page.template) {
    case "chapter-opener":
      return <ChapterOpenerSpread page={page} />;
    case "diagram":
      return <DiagramSpread page={page} />;
    case "code":
      return <CodeSpread page={page} />;
    case "checklist":
      return <ChecklistSpread page={page} />;
    case "modules":
      return <DiagramSpread page={page} />;
    default:
      return <ContentSpread page={page} />;
  }
}
