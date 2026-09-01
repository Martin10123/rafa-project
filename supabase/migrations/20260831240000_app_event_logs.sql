create table public.app_event_logs (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (category in (
      'auth', 'cart', 'checkout', 'orders', 'inventory',
      'gallery', 'catalog', 'storage', 'system'
    )),
  level text not null default 'info'
    check (level in ('info', 'warn', 'error')),
  event_type text not null,
  success boolean not null default false,
  message text,
  email text,
  user_id uuid references auth.users (id) on delete set null,
  entity_type text,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  route text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index app_event_logs_created_at_idx
  on public.app_event_logs (created_at desc);

create index app_event_logs_category_level_idx
  on public.app_event_logs (category, level, created_at desc);

create index app_event_logs_event_type_idx
  on public.app_event_logs (event_type, created_at desc);

create index app_event_logs_entity_idx
  on public.app_event_logs (entity_type, entity_id);

create index app_event_logs_email_idx
  on public.app_event_logs (email, created_at desc);

alter table public.app_event_logs enable row level security;

grant insert on public.app_event_logs to anon, authenticated;
grant select on public.app_event_logs to authenticated;

create policy "app_logs_insert_public"
on public.app_event_logs
for insert
to anon, authenticated
with check (true);

create policy "app_logs_admin_read"
on public.app_event_logs
for select
to authenticated
using (private.is_admin());

insert into public.app_event_logs (
  category,
  level,
  event_type,
  success,
  message,
  email,
  user_id,
  detail,
  user_agent,
  created_at
)
select
  'auth',
  case when success then 'info' else 'error' end,
  event_type,
  success,
  message,
  email,
  user_id,
  detail,
  user_agent,
  created_at
from public.auth_event_logs;

drop policy if exists "auth_logs_insert_public" on public.auth_event_logs;
drop policy if exists "auth_logs_admin_read" on public.auth_event_logs;
drop table if exists public.auth_event_logs;
