alter table documents
  add column if not exists deleted_at timestamptz,
  add column if not exists purge_after_at timestamptz;

create index if not exists documents_user_id_deleted_at_idx
  on documents (user_id, deleted_at, created_at desc);

create index if not exists documents_purge_after_at_idx
  on documents (purge_after_at)
  where deleted_at is not null;
