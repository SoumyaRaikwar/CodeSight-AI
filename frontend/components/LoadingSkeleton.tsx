export function LoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-1 p-4">
      <div className="h-4 w-1/3 animate-shimmer rounded bg-gradient-to-r from-surface-3 via-surface-4 to-surface-3 bg-[length:200%_100%]" />
      <div className="h-3 w-full animate-shimmer rounded bg-gradient-to-r from-surface-3 via-surface-4 to-surface-3 bg-[length:200%_100%]" />
      <div className="h-3 w-2/3 animate-shimmer rounded bg-gradient-to-r from-surface-3 via-surface-4 to-surface-3 bg-[length:200%_100%]" />
    </div>
  );
}
