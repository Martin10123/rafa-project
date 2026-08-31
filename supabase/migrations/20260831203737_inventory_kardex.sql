create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  type text not null check (type in ('in', 'out', 'reserve', 'release', 'adjust')),
  quantity integer not null check (quantity > 0),
  occurred_at timestamptz not null default now(),
  source text not null default 'manual',
  reference_id uuid,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_movements_product_id_idx
  on public.inventory_movements (product_id);

create index inventory_movements_occurred_at_idx
  on public.inventory_movements (occurred_at desc);

alter table public.inventory_movements enable row level security;

grant select on public.inventory_movements to anon, authenticated;
grant insert on public.inventory_movements to authenticated;

create policy "movements_read_all"
on public.inventory_movements
for select
to anon, authenticated
using (true);

create policy "movements_admin_insert"
on public.inventory_movements
for insert
to authenticated
with check (private.is_admin());

create or replace view public.stock_available
with (security_invoker = true)
as
select
  p.id as product_id,
  p.bead_size,
  p.name,
  coalesce(
    sum(
      case
        when m.type = 'in' then m.quantity
        when m.type in ('out', 'adjust') then -m.quantity
        else 0
      end
    ),
    0
  )::integer as physical_qty,
  coalesce(
    sum(
      case
        when m.type = 'reserve' then m.quantity
        when m.type = 'release' then -m.quantity
        else 0
      end
    ),
    0
  )::integer as reserved_qty,
  (
    coalesce(
      sum(
        case
          when m.type = 'in' then m.quantity
          when m.type in ('out', 'adjust') then -m.quantity
          else 0
        end
      ),
      0
    )
    - coalesce(
      sum(
        case
          when m.type = 'reserve' then m.quantity
          when m.type = 'release' then -m.quantity
          else 0
        end
      ),
      0
    )
  )::integer as available_qty
from public.products as p
left join public.inventory_movements as m
  on m.product_id = p.id
group by p.id, p.bead_size, p.name;

grant select on public.stock_available to anon, authenticated;
