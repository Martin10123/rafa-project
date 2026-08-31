---
name: manillas-arquitectura
description: >-
  Folder layout, dependency rules, Auth/RLS, and phase scope for the Rafa
  manillas Vite + React + Supabase app. Use when adding a page, feature,
  domain type, repository, Supabase table, or when unsure where a file belongs.
---

# Arquitectura — rafa-project

## Carpetas

```
src/
  app/          # router, layouts, providers
  domain/       # tipos y reglas; sin React ni Supabase
  data/         # cliente Supabase, repositorios, mappers
  features/     # UI + hooks de un caso de uso
  pages/        # composición por ruta
  shared/       # UI y utilidades sin dominio de negocio
```

## Dependencias

`pages → features → domain`. `data` implementa; las páginas no importan `data` ni el cliente Supabase.

El visor 3D (cuando exista) vive en `features/customizer` y no importa inventario ni pagos.

## Auth

Roles: `customer` | `admin` en `profiles.role` y en `app_metadata.role`.
Nunca autorizar con `user_metadata`.
`private.is_admin()` es la fuente para RLS.

La tienda y el catálogo son públicos. La cuenta es opcional (historial, promociones). Login y registro van en Dialog de shadcn desde el navbar.
UI: componentes en `src/components/ui` (shadcn Nova). Tipografía de títulos: `text-xs` / `text-sm` / `text-base`.

## No adelantar fases

Implementar solo la fase pedida.
- Hecho: fase 0, fase 1 (catálogo), fase 2 (kardex / inventario).
- Pendiente: carrito, comprobantes, plan separe, R3F.

## Marcar admin (Rafa)

En el SQL Editor de Supabase, con el `id` de `auth.users`:

```sql
update public.profiles
set role = 'admin'
where id = '<user-uuid>';

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where id = '<user-uuid>';
```

El usuario debe volver a iniciar sesión para refrescar el JWT.
