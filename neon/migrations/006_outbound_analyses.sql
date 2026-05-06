alter table analyses
  add column if not exists analysis_kind text not null default 'received_contract_review',
  add column if not exists analysis_perspective text not null default 'receiver',
  add column if not exists source_document_id uuid references documents(id) on delete cascade,
  add column if not exists reference_document_id uuid references documents(id) on delete set null,
  add column if not exists final_verdict text,
  add column if not exists proposal_consistency_score integer,
  add column if not exists send_readiness_score integer,
  add column if not exists executive_recommendation text,
  add column if not exists checklist jsonb not null default '[]'::jsonb,
  add column if not exists matched_points jsonb not null default '[]'::jsonb,
  add column if not exists missing_points jsonb not null default '[]'::jsonb,
  add column if not exists internal_notes text;

update analyses
set source_document_id = document_id
where source_document_id is null;

create index if not exists analyses_user_id_kind_created_at_idx
  on analyses (user_id, analysis_kind, created_at desc);

create index if not exists analyses_source_document_kind_created_at_idx
  on analyses (source_document_id, analysis_kind, created_at desc);

create index if not exists analyses_reference_document_kind_created_at_idx
  on analyses (reference_document_id, analysis_kind, created_at desc)
  where reference_document_id is not null;

create table if not exists analysis_issues (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  issue_type text not null,
  severity text not null,
  title text not null,
  description text,
  source_excerpt text,
  reference_excerpt text,
  recommended_fix text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analysis_issues_analysis_id_idx
  on analysis_issues (analysis_id, created_at desc);
