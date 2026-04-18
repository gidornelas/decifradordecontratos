create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  avatar_url text,
  plan_code text not null default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  remember_session boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  original_name text not null,
  mime_type text not null,
  extension text,
  size_bytes bigint not null default 0,
  storage_bucket text,
  storage_path text,
  extracted_text text,
  processing_status text not null default 'uploaded',
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending',
  contract_type text,
  risk_score integer,
  summary text,
  recommendation text,
  model_name text,
  prompt_version text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists analysis_risks (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  clause_number text,
  title text not null,
  severity text not null,
  category text,
  original_excerpt text,
  simplified_explanation text,
  impact_description text,
  recommendation text,
  confidence text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists analysis_clauses (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  clause_number text,
  clause_title text,
  original_text text,
  simplified_text text,
  why_it_matters text,
  severity text,
  confidence text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists users_email_idx
  on users (email);

create index if not exists sessions_user_id_expires_at_idx
  on sessions (user_id, expires_at desc);

create index if not exists sessions_token_hash_idx
  on sessions (token_hash);

create index if not exists documents_user_id_created_at_idx
  on documents (user_id, created_at desc);

create index if not exists analyses_user_id_created_at_idx
  on analyses (user_id, created_at desc);

create index if not exists analysis_risks_analysis_id_idx
  on analysis_risks (analysis_id);

create index if not exists analysis_clauses_analysis_id_idx
  on analysis_clauses (analysis_id);
