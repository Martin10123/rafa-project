create table public.auth_event_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  email text,
  user_id uuid references auth.users (id) on delete set null,
  success boolean not null default false,
  message text,
  detail jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index auth_event_logs_created_at_idx
  on public.auth_event_logs (created_at desc);

create index auth_event_logs_event_type_idx
  on public.auth_event_logs (event_type, created_at desc);

create index auth_event_logs_email_idx
  on public.auth_event_logs (email, created_at desc);

alter table public.auth_event_logs enable row level security;

grant insert on public.auth_event_logs to anon, authenticated;
grant select on public.auth_event_logs to authenticated;

create policy "auth_logs_insert_public"
on public.auth_event_logs
for insert
to anon, authenticated
with check (true);

create policy "auth_logs_admin_read"
on public.auth_event_logs
for select
to authenticated
using (private.is_admin());
