create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'awaiting_proof'
    check (status in ('awaiting_proof', 'review', 'approved', 'rejected', 'cancelled')),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  bead_size smallint,
  product_name text not null,
  presentation_label text not null,
  unit text,
  price_cents integer not null check (price_cents >= 0),
  quantity integer not null check (quantity > 0),
  thread_color text,
  line_total_cents integer not null check (line_total_cents >= 0)
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  storage_path text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index orders_status_idx on public.orders (status, created_at desc);
create index orders_user_id_idx on public.orders (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index payment_proofs_order_id_idx on public.payment_proofs (order_id, submitted_at desc);
create index payment_proofs_status_idx on public.payment_proofs (status, submitted_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function private.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_proofs enable row level security;

grant select, insert on public.orders to anon, authenticated;
grant update on public.orders to authenticated;

grant select, insert on public.order_items to anon, authenticated;

grant select, insert on public.payment_proofs to anon, authenticated;
grant update on public.payment_proofs to authenticated;

create policy "orders_insert_public"
on public.orders
for insert
to anon, authenticated
with check (user_id is null or user_id = (select auth.uid()));

create policy "orders_select_own"
on public.orders
for select
to authenticated
using (user_id = (select auth.uid()) or private.is_admin());

create policy "orders_admin_manage"
on public.orders
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "order_items_insert_public"
on public.order_items
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.orders as o
    where o.id = order_id
      and o.status = 'awaiting_proof'
  )
);

create policy "order_items_select_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders as o
    where o.id = order_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  )
);

create policy "order_items_admin_read"
on public.order_items
for select
to authenticated
using (private.is_admin());

create policy "payment_proofs_insert_public"
on public.payment_proofs
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.orders as o
    where o.id = order_id
      and o.status = 'awaiting_proof'
  )
);

create policy "payment_proofs_select_own"
on public.payment_proofs
for select
to authenticated
using (
  exists (
    select 1
    from public.orders as o
    where o.id = order_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  )
);

create policy "payment_proofs_admin_manage"
on public.payment_proofs
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "payment_proofs_storage_upload"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'payment-proofs'
  and exists (
    select 1
    from public.orders as o
    where o.id::text = (storage.foldername (name))[1]
      and o.status = 'awaiting_proof'
  )
);

create policy "payment_proofs_storage_admin_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'payment-proofs' and private.is_admin());

create policy "payment_proofs_storage_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'payment-proofs' and private.is_admin());

create or replace function public.create_store_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal integer := 0;
  v_item jsonb;
  v_qty integer;
  v_price integer;
  v_line_total integer;
  v_user_id uuid;
begin
  if p_customer_name is null or length(trim(p_customer_name)) < 2 then
    raise exception 'Nombre inválido';
  end if;

  if p_customer_phone is null or length(trim(p_customer_phone)) < 7 then
    raise exception 'Teléfono inválido';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  v_user_id := auth.uid();

  for v_item in select value from jsonb_array_elements(p_items) as t(value)
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'price_cents')::integer;

    if v_qty is null or v_qty <= 0 then
      raise exception 'Cantidad inválida';
    end if;

    if v_price is null or v_price < 0 then
      raise exception 'Precio inválido';
    end if;

    v_line_total := v_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  insert into public.orders (
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    status,
    subtotal_cents
  )
  values (
    v_user_id,
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    'awaiting_proof',
    v_subtotal
  )
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) as t(value)
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'price_cents')::integer;
    v_line_total := v_price * v_qty;

    insert into public.order_items (
      order_id,
      product_id,
      bead_size,
      product_name,
      presentation_label,
      unit,
      price_cents,
      quantity,
      thread_color,
      line_total_cents
    )
    values (
      v_order_id,
      nullif(v_item ->> 'product_id', '')::uuid,
      nullif(v_item ->> 'bead_size', '')::smallint,
      coalesce(v_item ->> 'product_name', 'Producto'),
      coalesce(v_item ->> 'presentation_label', 'Presentación'),
      nullif(v_item ->> 'unit', ''),
      v_price,
      v_qty,
      nullif(v_item ->> 'thread_color', ''),
      v_line_total
    );
  end loop;

  return v_order_id;
end;
$$;

grant execute on function public.create_store_order(text, text, text, jsonb) to anon, authenticated;

create or replace function public.submit_payment_proof(
  p_order_id uuid,
  p_storage_path text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proof_id uuid;
  v_order_status text;
begin
  if p_storage_path is null or length(trim(p_storage_path)) = 0 then
    raise exception 'Ruta de comprobante inválida';
  end if;

  select status
  into v_order_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order_status <> 'awaiting_proof' then
    raise exception 'Este pedido ya tiene un comprobante enviado';
  end if;

  insert into public.payment_proofs (order_id, storage_path, status)
  values (p_order_id, trim(p_storage_path), 'pending')
  returning id into v_proof_id;

  update public.orders
  set status = 'review'
  where id = p_order_id;

  return v_proof_id;
end;
$$;

grant execute on function public.submit_payment_proof(uuid, text) to anon, authenticated;

create or replace function public.review_payment_proof(
  p_proof_id uuid,
  p_approve boolean,
  p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_item record;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.payment_proofs
  set
    status = case when p_approve then 'approved' else 'rejected' end,
    rejection_reason = case when p_approve then null else nullif(trim(coalesce(p_rejection_reason, '')), '') end,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where id = p_proof_id
    and status = 'pending'
  returning order_id into v_order_id;

  if not found then
    raise exception 'Comprobante no encontrado o ya revisado';
  end if;

  update public.orders
  set status = case when p_approve then 'approved' else 'rejected' end
  where id = v_order_id;

  if p_approve then
    for v_item in
      select oi.product_id, oi.quantity, oi.unit
      from public.order_items as oi
      where oi.order_id = v_order_id
        and oi.product_id is not null
        and oi.unit = 'c/u'
    loop
      insert into public.inventory_movements (
        product_id,
        type,
        quantity,
        source,
        reference_id,
        notes,
        created_by
      )
      values (
        v_item.product_id,
        'out',
        v_item.quantity,
        'order',
        v_order_id,
        'Salida por pedido aprobado',
        auth.uid()
      );
    end loop;
  end if;
end;
$$;

grant execute on function public.review_payment_proof(uuid, boolean, text) to authenticated;
