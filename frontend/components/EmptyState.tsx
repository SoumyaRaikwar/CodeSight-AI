export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-1/40 p-5 text-sm">
      <p className="font-display text-base text-text-primary">{title}</p>
      <p className="mt-1 text-muted">{description}</p>
    </div>
  );
}
