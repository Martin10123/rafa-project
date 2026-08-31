import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <Link to={`/producto/${product.beadSize}`} className="block h-full">
      <Card size="sm" className="h-full overflow-hidden transition-colors hover:bg-muted/40">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 via-amber-50 to-slate-200">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1">
              <span className="text-base font-medium text-foreground">
                #{product.beadSize}
              </span>
              <span className="text-xs text-muted-foreground">Vista 3D en ficha</span>
            </div>
          )}
        </div>
        <CardHeader>
          <CardDescription className="text-xs">
            {product.approxMm ? `~${product.approxMm} mm` : 'Tamaño'}
          </CardDescription>
          <CardTitle className="text-base">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description ?? 'Sin descripción.'}
          </p>
        </CardContent>
        <CardFooter className="justify-between gap-2">
          <p className="text-sm font-medium tabular-nums text-foreground">
            {formatPriceLabel(product.priceCents)}
            {product.priceCents !== null ? ' c/u' : ''}
          </p>
          <span
            className={`text-xs ${soldOut ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {formatStockLabel(product.stockQty)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function CatalogGrid() {
  const { data, isLoading, isError, error } = useCatalogProducts()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en
        .env.local, y aplica la migración de productos.
      </p>
    )
  }

  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className="h-64 animate-pulse rounded-xl bg-muted" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudo cargar el catálogo.'}
      </p>
    )
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay productos activos.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
