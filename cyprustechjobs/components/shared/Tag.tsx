"use client";

import { cn } from "@/lib/utils/cn";

interface TagProps {
  children: React.ReactNode;
  variant?: "filled" | "outlined";
  className?: string;
}

export function Tag({ children, variant = "filled", className }: TagProps) {
  return (
    <span
      className={cn(
        "text-mono-s inline-flex items-center px-2 py-0.5 rounded-xs",
        variant === "filled" && "bg-neutral-100 text-text-muted",
        variant === "outlined" &&
          "border border-border-strong bg-transparent text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
