import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { Tag } from "@/components/shared/Tag";
import { cn } from "@/lib/utils/cn";

export interface JobCardData {
  id: string;
  slug: string;
  title: string;
  company: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  location: string | null;
  workType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  featured: boolean;
  createdAt: string | Date;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    `${currency === "EUR" ? "€" : currency}${Math.round(n / 1000)}K`;
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

interface JobCardProps {
  job: JobCardData;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const ago = formatDistanceToNow(new Date(job.createdAt), { addSuffix: false })
    .replace("about ", "")
    .toUpperCase();

  return (
    <article
      className={cn(
        "relative bg-surface border border-border rounded-md p-5",
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]",
        "hover:border-text hover:-translate-y-0.5 hover:shadow-md",
        "group",
        className
      )}
    >
      {/* FEATURED ribbon */}
      {job.featured && (
        <div
          className="absolute top-0 right-0 text-mono-s text-white bg-accent px-2.5 py-1"
          style={{
            borderRadius: "0 var(--radius-md) 0 var(--radius-xs)",
          }}
        >
          FEATURED
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Logo */}
        <CompanyLogo
          name={job.company.name}
          logoUrl={job.company.logoUrl}
          size={56}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top row: company + time · salary */}
          <div className="flex items-start justify-between gap-4">
            <div className="text-mono-s text-text-muted">
              <Link
                href={`/companies/${job.company.slug}`}
                className="font-sans font-medium text-[13px] text-text-muted hover:text-text transition-colors"
              >
                {job.company.name}
              </Link>
              <span className="text-text-subtle"> · {ago} AGO</span>
            </div>

            {salary && (
              <span className="text-mono shrink-0 text-pink-500 font-mono">
                {salary}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-body-l font-semibold tracking-[-0.01em] mt-1 mb-3 text-text pr-4 leading-[22px]">
            <Link
              href={`/jobs/${job.slug}`}
              className="hover:text-accent transition-colors"
            >
              {job.title}
            </Link>
          </h3>

          {/* Bottom row: tags · apply button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {job.location && (
                <Tag variant="filled">{job.location}</Tag>
              )}
              <Tag variant="outlined">{job.workType}</Tag>
              <Tag variant="outlined">{job.employmentType}</Tag>
              <Tag variant="outlined">{job.experienceLevel}</Tag>
            </div>

            <Link
              href={`/jobs/${job.slug}`}
              className="btn btn-accent btn-sm shrink-0 gap-1"
            >
              Apply now <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
