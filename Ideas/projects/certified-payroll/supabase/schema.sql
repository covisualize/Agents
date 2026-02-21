create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  user_id uuid not null references users(id),
  organization_id uuid not null references organizations(id),
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  stripe_subscription_id text unique,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  contract_number text,
  created_at timestamptz not null default now()
);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  full_name text not null,
  classification text not null,
  fringe_rate numeric(10,2),
  created_at timestamptz not null default now()
);

create table if not exists timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  worker_id uuid not null references workers(id),
  work_date date not null,
  hours numeric(6,2) not null,
  wage_rate numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists payroll_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('draft', 'submitted', 'rejected', 'corrected')),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists compliance_reports (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references payroll_runs(id),
  revision integer not null default 1,
  status text not null check (status in ('draft', 'submitted', 'rejected', 'accepted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists report_rejections (
  id uuid primary key default gen_random_uuid(),
  compliance_report_id uuid not null references compliance_reports(id),
  reason_code text not null,
  notes text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
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
  actor_id uuid not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
