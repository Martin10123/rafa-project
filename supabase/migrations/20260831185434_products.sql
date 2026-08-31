create table public.products (
  id uuid primary key default gen_random_uuid(),
  bead_size smallint not null unique check (bead_size between 3 and 8),
  name text not null,
  price_cents integer check (price_cents is null or price_cents >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function private.set_updated_at();

insert into public.products (bead_size, name, price_cents, stock_qty) values
  (3, 'Balín #3', 3000000, 0),
  (4, 'Balín #4', 4500000, 0),
  (5, 'Balín #5', 6000000, 0),
  (6, 'Balín #6', 8000000, 0),
  (7, 'Balín #7', null, 0),
  (8, 'Balín #8', null, 0);

alter table public.products enable row level security;

grant select on public.products to anon, authenticated;
grant update (name, price_cents, stock_qty, is_active) on public.products to authenticated;

create policy "products_anon_read_active"
on public.products
for select
to anon
using (is_active = true);

create policy "products_auth_read"
on public.products
for select
to authenticated
using (is_active = true or private.is_admin());

create policy "products_admin_update"
on public.products
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());
