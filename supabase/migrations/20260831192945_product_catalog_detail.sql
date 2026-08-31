alter table public.products
  add column if not exists description text,
  add column if not exists approx_mm numeric(4, 1),
  add column if not exists cover_image_url text,
  add column if not exists presentations jsonb not null default '[]'::jsonb;

grant update (
  name,
  price_cents,
  stock_qty,
  is_active,
  description,
  approx_mm,
  cover_image_url,
  presentations
) on public.products to authenticated;

-- Precios y copy del Catálogo R18k v1 (#3–#5). Sin fotos aún.
update public.products
set
  name = 'Balines #3',
  approx_mm = 3,
  price_cents = 2990000,
  description = 'Balines #3 en oro 18k de aproximadamente 3 mm, seleccionados por su delicadeza y brillo sutil. Su tamaño es tradicionalmente utilizado en diseños finos como manillas de bebé y anillos, aportando una estética sutil y sofisticada.',
  cover_image_url = null,
  presentations = '[
    {"label":"Balín suelto","price_cents":2990000,"unit":"c/u","image_url":null},
    {"label":"Manilla armada","price_cents":6490000,"unit":null,"image_url":null},
    {"label":"Manilla premium","price_cents":9490000,"unit":null,"image_url":null}
  ]'::jsonb
where bead_size = 3;

update public.products
set
  name = 'Balines #4',
  approx_mm = 4,
  price_cents = 4490000,
  description = 'Balines #4 en oro 18k de aproximadamente 4 mm, elegidos por su equilibrio entre presencia y sofisticación. Su tamaño es comúnmente utilizado en diseños para jóvenes y adultos, aportando un estilo más definido sin perder elegancia.',
  cover_image_url = null,
  presentations = '[
    {"label":"Balín suelto","price_cents":4490000,"unit":"c/u","image_url":null},
    {"label":"Manilla en estuche","price_cents":27500000,"unit":null,"image_url":null},
    {"label":"Manilla cordón","price_cents":14000000,"unit":"c/u","image_url":null}
  ]'::jsonb
where bead_size = 4;

update public.products
set
  name = 'Balines #5',
  approx_mm = 5,
  price_cents = 5990000,
  description = 'Balines #5 en oro 18k de aproximadamente 5 mm, seleccionados por su impacto visual y carácter definido. Este tamaño resalta en diseños de mayor presencia, brindando una estética firme y un estilo sólido con un acabado sofisticado.',
  cover_image_url = null,
  presentations = '[
    {"label":"Balín suelto","price_cents":5990000,"unit":"c/u","image_url":null},
    {"label":"Manilla en estuche","price_cents":35940000,"unit":null,"image_url":null},
    {"label":"Manilla cordón","price_cents":17970000,"unit":"c/u","image_url":null}
  ]'::jsonb
where bead_size = 5;

update public.products
set
  name = 'Balines #6',
  approx_mm = 6,
  description = 'Balines #6 en oro 18k. Presentación y fotos del catálogo pendientes.'
where bead_size = 6;

update public.products
set
  name = 'Balines #7',
  approx_mm = 7,
  description = 'Balines #7 en oro 18k. Precio y fotos por definir.'
where bead_size = 7;

update public.products
set
  name = 'Balines #8',
  approx_mm = 8,
  description = 'Balines #8 en oro 18k. Precio y fotos por definir.'
where bead_size = 8;
