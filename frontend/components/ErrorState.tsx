import { AlertTriangle } from "lucide-react";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 text-sm text-rose-100">
      <p className="inline-flex items-center gap-2 font-semibold"><AlertTriangle size={15} /> {title}</p>
      <p className="mt-1 text-rose-100/80">{description}</p>
    </div>
  );
}
