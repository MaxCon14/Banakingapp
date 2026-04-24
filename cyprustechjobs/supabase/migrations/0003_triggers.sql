-- 0003_triggers.sql
-- search_vector maintenance + job quota enforcement

-- ─── 1. search_vector trigger ──────────────────────────────────────────────
-- Denormalises company name into the jobs row so FTS works across
-- title, description, and company name in a single tsvector column.

create or replace function jobs_search_vector_update()
returns trigger
language plpgsql
as $$
declare
  v_company_name text;
begin
  select name into v_company_name
  from companies
  where id = new.company_id;

  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(v_company_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');

  return new;
end;
$$;

create trigger jobs_search_vector_trigger
before insert or update on jobs
for each row execute function jobs_search_vector_update();

-- ─── 2. Quota check function ───────────────────────────────────────────────
-- Returns true when employer is below the 3-listing free-tier cap.

create or replace function can_post_job(employer_id uuid)
returns boolean
language sql
stable
as $$
  select count(*) < 3
  from jobs
  where company_id = employer_id
    and status = 'active';
$$;

-- ─── 3. Quota enforcement trigger ─────────────────────────────────────────
-- Raises an exception before an INSERT that would exceed the cap.

create or replace function enforce_job_quota()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and not can_post_job(new.company_id) then
    raise exception 'quota_exceeded'
      using hint = 'Upgrade to post more than 3 active listings';
  end if;
  return new;
end;
$$;

create trigger jobs_quota_trigger
before insert on jobs
for each row execute function enforce_job_quota();

-- ─── 4. updated_at auto-maintenance ───────────────────────────────────────

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger seeker_profiles_updated_at
  before update on seeker_profiles
  for each row execute function set_updated_at();

create trigger companies_updated_at
  before update on companies
  for each row execute function set_updated_at();

create trigger jobs_updated_at
  before update on jobs
  for each row execute function set_updated_at();
