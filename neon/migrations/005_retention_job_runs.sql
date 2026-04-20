create table if not exists retention_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null,
  trigger_source text,
  request_id text,
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  duration_ms integer,
  result jsonb not null default '{}'::jsonb,
  error_message text
);

create index if not exists retention_job_runs_job_name_started_at_idx
  on retention_job_runs (job_name, started_at desc);

create index if not exists retention_job_runs_status_started_at_idx
  on retention_job_runs (status, started_at desc);
