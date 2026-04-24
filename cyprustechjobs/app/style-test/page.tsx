import { ArrowRight, Bookmark, Search, SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { Tag } from "@/components/shared/Tag";
import { Chip } from "@/components/shared/Chip";

/* ─── Fake data ─────────────────────────────────── */
const SAMPLE_JOB = {
  id: "abc123",
  slug: "senior-product-designer-growth-at-revolut-abc123",
  title: "Senior Product Designer — Growth",
  company: { name: "Revolut", slug: "revolut", logoUrl: null },
  location: "Limassol",
  workType: "Hybrid",
  employmentType: "Full-time",
  experienceLevel: "Senior",
  salaryMin: 75000,
  salaryMax: 95000,
  salaryCurrency: "EUR",
  featured: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
};

const SAMPLE_JOB_2 = {
  ...SAMPLE_JOB,
  id: "def456",
  slug: "frontend-engineer-at-xm-def456",
  title: "Senior Frontend Engineer",
  company: { name: "XM", slug: "xm", logoUrl: null },
  location: "Nicosia",
  workType: "Remote",
  salaryMin: null,
  salaryMax: null,
  featured: false,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
};

/* ─── Section wrapper ────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-caption text-text-subtle mb-4">{title}</h2>
      {children}
    </section>
  );
}

/* ─── Page ───────────────────────────────────────── */
export default function StyleTestPage() {
  return (
    <div className="min-h-screen bg-bg-alt px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption text-text-subtle mb-2">Cyprus Tech Jobs</p>
          <h1 className="text-display-l text-text mb-2">Design system</h1>
          <p className="text-body text-text-muted">
            Visual reference for all tokens, primitives, and the signature Job Card.
          </p>
        </div>

        {/* ─── Typography ──────────────────────────── */}
        <Section title="Typography">
          <div className="bg-surface border border-border rounded-md p-6 space-y-3">
            <p className="text-display-xl text-text">Display XL · 56/60</p>
            <p className="text-display-l text-text">Display L · 44/48</p>
            <p className="text-display-m text-text">Display M · 32/38</p>
            <p className="text-h1 text-text">H1 · 28/34</p>
            <p className="text-h2 text-text">H2 · 22/28</p>
            <p className="text-h3 text-text">H3 · 18/24</p>
            <p className="text-body-l text-text">Body L · 17/26</p>
            <p className="text-body text-text">Body · 15/22 (default UI)</p>
            <p className="text-body-s text-text-muted">Body S · 13/18 (secondary)</p>
            <p className="text-caption text-text-subtle">Caption · 12/16 uppercase label</p>
            <hr className="border-border my-4" />
            <p className="text-mono-l text-text">Mono L · 14/20 — Fragment Mono</p>
            <p className="text-mono text-text">Mono · 12/16 — tags, pills, meta</p>
            <p className="text-mono-s text-text-subtle">Mono S · 11/14 — timestamps, IDs</p>
          </div>
        </Section>

        {/* ─── Colour swatches ─────────────────────── */}
        <Section title="Colour tokens">
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-sm border border-border"
                    style={{ background: `var(--pink-${n})` }}
                  />
                  <span className="text-mono-s text-text-subtle">{n}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-sm border border-border"
                    style={{ background: `var(--neutral-${n})` }}
                  />
                  <span className="text-mono-s text-text-subtle">{n}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              {(
                [
                  ["Success", "var(--success-bg)", "var(--success)"],
                  ["Warning", "var(--warning-bg)", "var(--warning)"],
                  ["Error",   "var(--error-bg)",   "var(--error)"],
                  ["Info",    "var(--info-bg)",     "var(--info)"],
                ] as const
              ).map(([label, bg, fg]) => (
                <div
                  key={label}
                  className="text-body-s px-3 py-1.5 rounded-sm font-medium"
                  style={{ background: bg, color: fg }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── Buttons ─────────────────────────────── */}
        <Section title="Button variants">
          <div className="bg-surface border border-border rounded-md p-6 space-y-4">
            {/* Sizes × Primary */}
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary btn-md">Medium</button>
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary btn-md" disabled>Disabled</button>
            </div>
            {/* Variants */}
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-primary btn-md">
                Primary (black)
              </button>
              <button className="btn btn-accent btn-md">
                Accent (pink) <ArrowRight size={14} />
              </button>
              <button className="btn btn-outline btn-md">
                Outline
              </button>
              <button className="btn btn-ghost btn-md">
                Ghost
              </button>
            </div>
            {/* With icons */}
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-outline btn-sm gap-1.5">
                <Search size={13} /> Search jobs
              </button>
              <button className="btn btn-outline btn-sm gap-1.5">
                <SlidersHorizontal size={13} /> Filters
              </button>
              <button className="btn btn-ghost btn-sm gap-1.5">
                <Bookmark size={13} /> Save
              </button>
            </div>
          </div>
        </Section>

        {/* ─── Tags ────────────────────────────────── */}
        <Section title="Tags">
          <div className="bg-surface border border-border rounded-md p-6">
            <div className="flex flex-wrap gap-2">
              <Tag variant="filled">Limassol</Tag>
              <Tag variant="outlined">Hybrid</Tag>
              <Tag variant="outlined">Full-time</Tag>
              <Tag variant="outlined">Senior</Tag>
              <Tag variant="outlined">Frontend</Tag>
              <Tag variant="filled">Remote</Tag>
              <Tag variant="outlined">Part-time</Tag>
              <Tag variant="outlined">Entry</Tag>
              <Tag variant="outlined">Contract</Tag>
            </div>
          </div>
        </Section>

        {/* ─── Filter chips ─────────────────────────── */}
        <Section title="Category chips (filter state)">
          <div className="bg-surface border border-border rounded-md p-6">
            <div className="flex flex-wrap gap-2">
              <Chip active count={142}>All</Chip>
              <Chip count={38}>Engineering</Chip>
              <Chip count={21}>Product</Chip>
              <Chip count={17}>Design</Chip>
              <Chip count={14}>Data</Chip>
              <Chip count={9}>DevOps</Chip>
              <Chip count={7}>Marketing</Chip>
              <Chip count={4}>Finance</Chip>
            </div>
          </div>
        </Section>

        {/* ─── Input ───────────────────────────────── */}
        <Section title="Input field">
          <div className="bg-surface border border-border rounded-md p-6 space-y-3 max-w-sm">
            <div>
              <label className="text-body-s font-medium text-text-muted block mb-1.5">
                Job title or keyword
              </label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Senior React Engineer…"
              />
            </div>
            <div>
              <label className="text-body-s font-medium text-text-muted block mb-1.5">
                Disabled
              </label>
              <input
                className="input opacity-50 cursor-not-allowed"
                type="text"
                placeholder="Not available"
                disabled
              />
            </div>
          </div>
        </Section>

        {/* ─── Job cards ───────────────────────────── */}
        <Section title="Job card — signature component">
          <div className="space-y-3">
            <JobCard job={SAMPLE_JOB} />
            <JobCard job={SAMPLE_JOB_2} />
          </div>
        </Section>

        {/* ─── Salary / mono data ───────────────────── */}
        <Section title="Mono data examples">
          <div className="bg-surface border border-border rounded-md p-6 space-y-2">
            <p className="text-mono-l text-pink-500">€75K — €95K</p>
            <p className="text-mono text-text-muted">Limassol · Hybrid · Full-time · Senior</p>
            <p className="text-mono-s text-text-subtle">Posted 2 hours ago · ID abc123</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
