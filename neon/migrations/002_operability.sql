create table if not exists api_rate_limits (
  scope text not null,
  subject text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  last_request_at timestamptz not null default timezone('utc', now()),
  primary key (scope, subject, window_start)
);

create index if not exists api_rate_limits_last_request_at_idx
  on api_rate_limits (last_request_at desc);
