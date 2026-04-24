-- 0002_rls.sql
-- Row Level Security policies

alter table profiles       enable row level security;
alter table seeker_profiles enable row level security;
alter table companies      enable row level security;
alter table jobs           enable row level security;
alter table applications   enable row level security;
alter table saved_jobs     enable row level security;

-- ─── profiles ──────────────────────────────────────────────────────────────
-- Users can only read and update their own profile row
create policy "profiles: owner read"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: owner update"
  on profiles for update
  using (auth.uid() = id);

-- ─── seeker_profiles ───────────────────────────────────────────────────────
-- Owner has full access; public can read only when is_public = true
create policy "seeker_profiles: owner all"
  on seeker_profiles for all
  using (auth.uid() = id);

create policy "seeker_profiles: public read when public"
  on seeker_profiles for select
  using (is_public = true);

-- ─── companies ─────────────────────────────────────────────────────────────
-- Owner has full access; everyone can read
create policy "companies: owner all"
  on companies for all
  using (auth.uid() = id);

create policy "companies: public read"
  on companies for select
  using (true);

-- ─── jobs ──────────────────────────────────────────────────────────────────
-- Public can read active jobs; employer reads/writes jobs they own
create policy "jobs: public read active"
  on jobs for select
  using (status = 'active');

create policy "jobs: owner read all"
  on jobs for select
  using (
    auth.uid() = company_id
  );

create policy "jobs: owner insert"
  on jobs for insert
  with check (auth.uid() = company_id);

create policy "jobs: owner update"
  on jobs for update
  using (auth.uid() = company_id);

create policy "jobs: owner delete"
  on jobs for delete
  using (auth.uid() = company_id);

-- ─── applications ──────────────────────────────────────────────────────────
-- Seeker reads their own; employer reads applications for jobs they own
create policy "applications: seeker read own"
  on applications for select
  using (auth.uid() = seeker_id);

create policy "applications: seeker insert"
  on applications for insert
  with check (auth.uid() = seeker_id);

create policy "applications: employer read for their jobs"
  on applications for select
  using (
    exists (
      select 1 from jobs
      where jobs.id = applications.job_id
        and jobs.company_id = auth.uid()
    )
  );

-- ─── saved_jobs ────────────────────────────────────────────────────────────
-- Seeker reads and writes their own saved jobs only
create policy "saved_jobs: seeker all"
  on saved_jobs for all
  using (auth.uid() = seeker_id);
