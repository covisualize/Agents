create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('venue', 'club', 'coach')),
  name text not null,
  metro text not null,
  state_code text,
  website text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists amenities (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  key text not null,
  value text not null
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  metro text not null,
  listing_type text not null,
  website text,
  submitted_by_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists listing_claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  claimant_email text not null,
  verification_note text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists sponsored_slots (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  metro text not null,
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  run_started_at timestamptz not null default now(),
  run_finished_at timestamptz,
  records_processed integer not null default 0,
  records_failed integer not null default 0
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
