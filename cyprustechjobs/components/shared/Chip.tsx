"use client";

import { cn } from "@/lib/utils/cn";

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  count?: number;
  className?: string;
}

export function Chip({
  children,
  active = false,
  onClick,
  count,
  className,
}: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-mono inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-[var(--duration-base)]",
        "font-mono text-[12px] leading-[16px]",
        active
          ? "bg-accent text-white border-accent"
          : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text",
        className
      )}
      type="button"
    >
      <span className="font-sans font-medium text-[13px]">{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-mono-s tabular-nums",
            active ? "text-white/80" : "text-text-subtle"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
