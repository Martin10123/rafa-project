import { Link } from 'react-router'
import {
  formatPriceLabel,
  formatStockLabel,
  type Product,
} from '@/domain/product/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { useCatalogProducts } from '@/features/catalog/useProducts'

function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stockQty <= 0

  return (
    <Link
      to={`/producto/${product.beadSize}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_50px_-28px] shadow-sky-500/40 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-sky-300/40 group-hover:bg-white/10">
        <div className="relative aspect-[4/3] overflow-hidden bg-linear-to-br from-blue-950 via-sky-900/40 to-yellow-200/10">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1">
              <span className="text-4xl font-semibold tracking-tight text-sky-100">
                #{product.beadSize}
              </span>
              <span className="text-xs text-sky-100/70">Vista 3D en la ficha</span>
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full border border-yellow-200/30 bg-yellow-300/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-950 uppercase">
            Oro 18k
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs tracking-wide text-sky-200/80 uppercase">
            {product.approxMm ? `~${product.approxMm} mm` : 'Tamaño'}
          </p>
          <h3 className="text-base font-semibold tracking-tight text-white">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-pretty text-slate-300">
            {product.description ?? 'Sin descripción.'}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <p className="text-lg font-semibold tabular-nums text-yellow-200">
              {formatPriceLabel(product.priceCents)}
              {product.priceCents !== null ? (
                <span className="ml-1 text-xs font-medium text-yellow-100/70">
                  c/u
                </span>
              ) : null}
            </p>
            <span
              className={`text-xs ${soldOut ? 'text-yellow-200' : 'text-sky-100/70'}`}
            >
              {soldOut ? 'Balines agotados' : formatStockLabel(product.stockQty)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function CatalogGrid() {
  const { data, isLoading, isError, error } = useCatalogProducts()

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-pretty text-sky-100/80 backdrop-blur-xl">
        Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en
        .env.local, y aplica la migración de productos.
      </p>
    )
  }

  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-pretty text-yellow-200">
        {error instanceof Error ? error.message : 'No se pudo cargar el catálogo.'}
      </p>
    )
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-sky-100/70">Aún no hay productos activos.</p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
