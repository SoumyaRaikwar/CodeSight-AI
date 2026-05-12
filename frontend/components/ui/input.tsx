import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-primary outline-none focus:shadow-focus",
        className
      )}
      {...props}
    />
  );
}
