create table if not exists document_audit_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  actor_user_id uuid references users(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists document_audit_events_document_id_created_at_idx
  on document_audit_events (document_id, created_at desc);

create index if not exists document_audit_events_user_id_created_at_idx
  on document_audit_events (user_id, created_at desc);
