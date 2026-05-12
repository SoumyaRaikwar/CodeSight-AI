import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent-hover disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
