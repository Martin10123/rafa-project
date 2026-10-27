-- Estado entregado, nota interna, datos de transferencia, fotos de producto
-- y reserva de balines sueltos al crear el pedido.

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint as con
    join pg_class as rel on rel.oid = con.conrelid
    join pg_namespace as nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'orders'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%status%'
  loop
    execute format('alter table public.orders drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'awaiting_proof',
    'review',
    'approved',
    'rejected',
    'cancelled',
    'delivered'
  ));

alter table public.orders
  add column if not exists admin_notes text;

update public.products
set presentations = (
  select coalesce(
    jsonb_agg(
      case
        when elem ->> 'label' = 'Manilla cordón' and elem ->> 'unit' = 'c/u'
          then jsonb_set(elem, '{unit}', 'null'::jsonb)
        else elem
      end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(presentations) with ordinality as t(elem, ord)
)
where bead_size in (4, 5);

create table public.store_payment_info (
  id integer primary key default 1 check (id = 1),
  bank_name text not null default '',
  account_type text not null default '',
  account_number text not null default '',
  holder_name text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.store_payment_info (id) values (1);

create trigger store_payment_info_set_updated_at
  before update on public.store_payment_info
  for each row
  execute function private.set_updated_at();

alter table public.store_payment_info enable row level security;

grant select on public.store_payment_info to anon, authenticated;
grant update (
  bank_name,
  account_type,
  account_number,
  holder_name
) on public.store_payment_info to authenticated;

create policy "store_payment_info_read"
on public.store_payment_info
for select
to anon, authenticated
using (true);

create policy "store_payment_info_admin_update"
on public.store_payment_info
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "product_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and private.is_admin());

create policy "product_images_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and private.is_admin())
with check (bucket_id = 'product-images' and private.is_admin());

create policy "product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and private.is_admin());

create or replace function private.product_available_qty(p_product_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select (
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
  )::integer
  from public.inventory_movements as m
  where m.product_id = p_product_id;
$$;

create or replace function private.order_reserved_qty(
  p_order_id uuid,
  p_product_id uuid
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    sum(
      case
        when m.type = 'reserve' then m.quantity
        when m.type = 'release' then -m.quantity
        else 0
      end
    ),
    0
  )::integer
  from public.inventory_movements as m
  where m.reference_id = p_order_id
    and m.product_id = p_product_id
    and m.source = 'order';
$$;

create or replace function private.lock_order_products(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  for v_product_id in
    select distinct oi.product_id
    from public.order_items as oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
      and oi.unit = 'c/u'
    order by oi.product_id
  loop
    perform 1
    from public.products
    where id = v_product_id
    for update;
  end loop;
end;
$$;

create or replace function private.release_order_reserves(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item record;
  v_reserved integer;
begin
  for v_item in
    select oi.product_id
    from public.order_items as oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
      and oi.unit = 'c/u'
    group by oi.product_id
    order by oi.product_id
  loop
    v_reserved := private.order_reserved_qty(p_order_id, v_item.product_id);
    if v_reserved > 0 then
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
        'release',
        v_reserved,
        'order',
        p_order_id,
        'Liberación de reserva',
        auth.uid()
      );
    end if;
  end loop;
end;
$$;

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
  v_stock record;
  v_available integer;
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

  perform private.lock_order_products(v_order_id);

  for v_stock in
    select lines.product_id, sum(lines.quantity)::integer as quantity
    from (
      select
        nullif(value ->> 'product_id', '')::uuid as product_id,
        (value ->> 'quantity')::integer as quantity,
        nullif(value ->> 'unit', '') as unit
      from jsonb_array_elements(p_items) as t(value)
    ) as lines
    where lines.unit = 'c/u'
      and lines.product_id is not null
    group by lines.product_id
    order by lines.product_id
  loop
    v_available := private.product_available_qty(v_stock.product_id);
    if v_available < v_stock.quantity then
      raise exception 'No hay stock suficiente de balines';
    end if;

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
      v_stock.product_id,
      'reserve',
      v_stock.quantity,
      'order',
      v_order_id,
      'Reserva por pedido',
      auth.uid()
    );
  end loop;

  return v_order_id;
end;
$$;

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
  v_status text;
  v_item record;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.payment_proofs
  set
    status = case when p_approve then 'approved' else 'rejected' end,
    rejection_reason = case
      when p_approve then null
      else nullif(trim(coalesce(p_rejection_reason, '')), '')
    end,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where id = p_proof_id
    and status = 'pending'
  returning order_id into v_order_id;

  if not found then
    raise exception 'Comprobante no encontrado o ya revisado';
  end if;

  select status
  into v_status
  from public.orders
  where id = v_order_id
  for update;

  if v_status <> 'review' then
    raise exception 'Este pedido no está en revisión';
  end if;

  perform private.lock_order_products(v_order_id);

  if p_approve then
    perform private.release_order_reserves(v_order_id);

    for v_item in
      select oi.product_id, sum(oi.quantity)::integer as quantity
      from public.order_items as oi
      where oi.order_id = v_order_id
        and oi.product_id is not null
        and oi.unit = 'c/u'
      group by oi.product_id
      order by oi.product_id
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
  else
    perform private.release_order_reserves(v_order_id);
  end if;

  update public.orders
  set status = case when p_approve then 'approved' else 'rejected' end
  where id = v_order_id;
end;
$$;

create or replace function public.get_order_checkout(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_reason text;
  v_items jsonb;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  select pp.rejection_reason
  into v_reason
  from public.payment_proofs as pp
  where pp.order_id = p_order_id
  order by pp.submitted_at desc
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'product_name', oi.product_name,
        'presentation_label', oi.presentation_label,
        'unit', oi.unit,
        'price_cents', oi.price_cents,
        'quantity', oi.quantity,
        'thread_color', oi.thread_color,
        'line_total_cents', oi.line_total_cents
      )
      order by oi.id
    ),
    '[]'::jsonb
  )
  into v_items
  from public.order_items as oi
  where oi.order_id = p_order_id;

  return jsonb_build_object(
    'id', v_order.id,
    'status', v_order.status,
    'subtotal_cents', v_order.subtotal_cents,
    'created_at', v_order.created_at,
    'customer_name', v_order.customer_name,
    'rejection_reason', v_reason,
    'items', v_items
  );
end;
$$;

grant execute on function public.get_order_checkout(uuid) to anon, authenticated;

create or replace function public.cancel_store_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  select status
  into v_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if v_status not in ('awaiting_proof', 'review') then
    raise exception 'Este pedido no se puede cancelar';
  end if;

  perform private.lock_order_products(p_order_id);
  perform private.release_order_reserves(p_order_id);

  update public.orders
  set status = 'cancelled'
  where id = p_order_id;
end;
$$;

grant execute on function public.cancel_store_order(uuid) to authenticated;

create or replace function public.mark_order_delivered(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.orders
  set status = 'delivered'
  where id = p_order_id
    and status = 'approved';

  if not found then
    raise exception 'Solo se puede marcar entregado un pedido aprobado';
  end if;
end;
$$;

grant execute on function public.mark_order_delivered(uuid) to authenticated;

create or replace function public.set_order_admin_notes(
  p_order_id uuid,
  p_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.orders
  set admin_notes = nullif(trim(coalesce(p_notes, '')), '')
  where id = p_order_id;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;
end;
$$;

grant execute on function public.set_order_admin_notes(uuid, text) to authenticated;
