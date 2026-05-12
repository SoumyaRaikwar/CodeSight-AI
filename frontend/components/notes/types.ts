export type SpreadTemplate =
  | "chapter-opener"
  | "standard"
  | "diagram"
  | "code"
  | "checklist"
  | "modules";

export type StudioPage = {
  id: string;
  title: string;
  chapter: string;
  markdown: string;
  index: number;
  template: SpreadTemplate;
  summary?: string;
  references?: string[];
};

export type ReadingMode = "reading" | "explore";
export type ViewMode = "studio" | "focus";
