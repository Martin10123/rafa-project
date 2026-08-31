create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  update auth.users
  set raw_app_meta_data =
    coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'customer')
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select p.role = 'admin'
      from public.profiles as p
      where p.id = auth.uid()
    ),
    false
  );
$$;

grant execute on function private.is_admin() to authenticated;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or private.is_admin());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
