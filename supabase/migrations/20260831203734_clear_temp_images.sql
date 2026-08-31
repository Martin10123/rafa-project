-- Quita URLs de capturas temporales del Canva. Las fotos reales se suben después.
update public.products
set
  cover_image_url = null,
  presentations = (
    select coalesce(
      jsonb_agg(
        (elem - 'image_url') || jsonb_build_object('image_url', null)
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(presentations, '[]'::jsonb)) as elem
  );
