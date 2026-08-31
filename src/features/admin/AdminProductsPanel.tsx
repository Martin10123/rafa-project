import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  centsToPesos,
  formatPriceLabel,
  formatStockLabel,
  pesosToCents,
  type Product,
} from '@/domain/product/types'
import {
  useAdminProducts,
  useUpdateProductPrice,
} from '@/features/catalog/useProducts'
import { isSupabaseConfigured } from '@/data/supabase/client'

function PriceRow({ product }: { product: Product }) {
  const mutation = useUpdateProductPrice()
  const [pesos, setPesos] = useState(
    product.priceCents === null ? '' : String(centsToPesos(product.priceCents)),
  )
  const [message, setMessage] = useState<string | undefined>()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    const trimmed = pesos.trim()
    let priceCents: number | null = null

    if (trimmed !== '') {
      const value = Number(trimmed)
      if (!Number.isFinite(value) || value < 0) {
        setMessage('Ingresa un precio válido en pesos.')
        return
      }
      priceCents = pesosToCents(value)
    }

    try {
      await mutation.mutateAsync({ productId: product.id, priceCents })
      setMessage('Guardado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar.')
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">#{product.beadSize}</p>
        <p className="text-xs text-muted-foreground">
          Actual: {formatPriceLabel(product.priceCents)} ·{' '}
          {formatStockLabel(product.stockQty)}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`price-${product.id}`} className="text-xs">
          Precio (COP, vacío = por definir)
        </Label>
        <Input
          id={`price-${product.id}`}
          inputMode="numeric"
          className="tabular-nums"
          value={pesos}
          onChange={(event) => setPesos(event.target.value)}
          placeholder="Ej. 30000"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          Guardar
        </Button>
        {message ? (
          <span className="text-xs text-muted-foreground">{message}</span>
        ) : null}
      </div>
    </form>
  )
}

export function AdminProductsPanel() {
  const { data, isLoading, isError, error } = useAdminProducts()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase en .env.local para editar precios.
      </p>
    )
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudieron cargar productos.'}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {data?.map((product) => (
        <PriceRow key={product.id} product={product} />
      ))}
    </div>
  )
}
