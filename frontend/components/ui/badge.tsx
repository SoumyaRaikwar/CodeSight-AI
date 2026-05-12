import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-accent",
        className
      )}
      {...props}
    />
  );
}
