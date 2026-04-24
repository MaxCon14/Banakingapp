import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

export function CompanyLogo({
  name,
  logoUrl,
  size = 56,
  className,
}: CompanyLogoProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative shrink-0 border border-border bg-surface rounded-sm overflow-hidden",
        "flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="object-contain"
        />
      ) : (
        <span
          className="font-sans font-semibold text-text-muted select-none"
          style={{ fontSize: Math.round(size * 0.3) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
