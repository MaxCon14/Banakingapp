-- 0001_init.sql
-- Core tables for CyprusTechJobs MVP

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('seeker', 'employer')),
  email        text not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table seeker_profiles (
  id               uuid primary key references profiles(id) on delete cascade,
  full_name        text,
  headline         text,
  bio              text,
  location         text,
  years_experience int,
  skills           text[] default '{}',
  website_url      text,
  linkedin_url     text,
  github_url       text,
  portfolio_url    text,
  resume_url       text,
  is_public        boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table companies (
  id          uuid primary key references profiles(id) on delete cascade,
  name        text not null,
  slug        text unique not null,
  logo_url    text,
  website_url text,
  size        text,
  industry    text,
  description text,
  location    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table jobs (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  slug            text unique not null,
  title           text not null,
  description     text not null,
  category        text not null,
  work_type       text not null check (work_type in ('Remote', 'Hybrid', 'On-site')),
  employment_type text not null check (employment_type in ('Full-time', 'Part-time', 'Contract', 'Internship')),
  experience_level text not null check (experience_level in ('Entry', 'Mid', 'Senior', 'Lead')),
  location        text,
  salary_min      int,
  salary_max      int,
  salary_currency text default 'EUR',
  apply_type      text not null check (apply_type in ('external', 'internal')),
  apply_url       text,
  status          text not null default 'active' check (status in ('active', 'draft', 'closed')),
  featured        boolean default false,
  search_vector   tsvector,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  expires_at      timestamptz default (now() + interval '60 days')
);

create index jobs_search_idx      on jobs using gin(search_vector);
create index jobs_status_created  on jobs(status, created_at desc);
create index jobs_category_idx    on jobs(category) where status = 'active';
create index jobs_location_idx    on jobs(location) where status = 'active';

create table applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references jobs(id) on delete cascade,
  seeker_id    uuid not null references seeker_profiles(id) on delete cascade,
  cover_letter text,
  resume_url   text,
  status       text default 'submitted',
  created_at   timestamptz default now(),
  unique(job_id, seeker_id)
);

create table saved_jobs (
  seeker_id  uuid references seeker_profiles(id) on delete cascade,
  job_id     uuid references jobs(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (seeker_id, job_id)
);
