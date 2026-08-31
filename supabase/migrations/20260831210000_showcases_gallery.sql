create table public.showcases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  template text not null default 'single'
    check (template in ('single', 'two_col', 'three_row', 'grid_2x2')),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  bead_size smallint check (bead_size is null or bead_size between 3 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.showcase_images (
  id uuid primary key default gen_random_uuid(),
  showcase_id uuid not null references public.showcases (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index showcases_sort_order_idx on public.showcases (sort_order asc, created_at desc);
create index showcase_images_showcase_id_idx on public.showcase_images (showcase_id, sort_order asc);

create trigger showcases_set_updated_at
  before update on public.showcases
  for each row
  execute function private.set_updated_at();

alter table public.showcases enable row level security;
alter table public.showcase_images enable row level security;

grant select on public.showcases to anon, authenticated;
grant insert, update, delete on public.showcases to authenticated;

grant select on public.showcase_images to anon, authenticated;
grant insert, update, delete on public.showcase_images to authenticated;

create policy "showcases_public_read"
on public.showcases
for select
to anon, authenticated
using (is_published = true);

create policy "showcases_admin_write"
on public.showcases
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "showcase_images_public_read"
on public.showcase_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.showcases as s
    where s.id = showcase_id
      and s.is_published = true
  )
);

create policy "showcase_images_admin_write"
on public.showcase_images
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'showcases',
  'showcases',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "showcases_storage_public_read"
on storage.objects
for select
to public
using (bucket_id = 'showcases');

create policy "showcases_storage_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'showcases' and private.is_admin());

create policy "showcases_storage_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'showcases' and private.is_admin())
with check (bucket_id = 'showcases' and private.is_admin());

create policy "showcases_storage_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'showcases' and private.is_admin());
