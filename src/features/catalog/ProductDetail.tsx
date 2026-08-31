import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatPresentationPrice,
  formatStockLabel,
  isBeadSize,
  type BeadSize,
  type Product,
  type ProductPresentation,
} from '@/domain/product/types'
import {
  addBlockedReason,
  canAddPresentation,
  findDefaultPresentationIndex,
  isLooseBeadUnit,
} from '@/domain/cart/types'
import { useProduct } from '@/features/catalog/useProducts'
import { useCartActions } from '@/features/cart/useCart'
import { useCartUiStore } from '@/features/cart/cart-ui-store'
import { BeadViewerSuspense } from '@/features/scene3d/BeadViewerLazy'
import type { ThreadColor } from '@/features/scene3d/BeadSceneContent'

type ProductDetailProps = {
  beadSizeParam: string
}

const THREAD_OPTIONS: { id: ThreadColor; label: string }[] = [
  { id: 'negro', label: 'Negro' },
  { id: 'rojo', label: 'Rojo' },
  { id: 'gris', label: 'Gris' },
]

function PresentationCard({
  item,
  selected,
  onSelect,
}: {
  item: ProductPresentation
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-colors ${
        selected ? 'border-primary ring-2 ring-ring/40' : 'border-border'
      }`}
    >
      <div className="flex flex-col gap-1 p-3">
        <p className="text-xs text-muted-foreground">{item.label}</p>
        <p className="text-sm font-medium tabular-nums text-foreground">
          {formatPresentationPrice(item.priceCents, item.unit)}
        </p>
      </div>
    </button>
  )
}

function DetailContent({ product }: { product: Product }) {
  const { addLine } = useCartActions()
  const openDrawer = useCartUiStore((state) => state.openDrawer)
  const soldOut = product.stockQty <= 0
  const presentations =
    product.presentations.length > 0
      ? product.presentations
      : [
          {
            label: 'Balín suelto',
            priceCents: product.priceCents,
            unit: product.priceCents === null ? null : 'c/u',
            imageUrl: product.coverImageUrl,
          } satisfies ProductPresentation,
        ]

  const [selectedIndex, setSelectedIndex] = useState(() =>
    findDefaultPresentationIndex(presentations, product.stockQty),
  )
  const [threadColor, setThreadColor] = useState<ThreadColor>('negro')
  const [quantity, setQuantity] = useState('1')
  const [cartMessage, setCartMessage] = useState<string | undefined>()
  const selected = presentations[selectedIndex] ?? presentations[0]
  const heroImage = selected?.imageUrl ?? product.coverImageUrl
  const selectedPrice = selected?.priceCents ?? product.priceCents
  const selectedUnit =
    selected?.unit ?? (product.priceCents === null ? null : 'c/u')
  const looseBeads = isLooseBeadUnit(selectedUnit)
  const canAdd = canAddPresentation(selectedPrice, selectedUnit, product.stockQty)
  const blockedReason = addBlockedReason(
    selectedPrice,
    selectedUnit,
    product.stockQty,
  )

  function onAddToCart() {
    setCartMessage(undefined)
    const qty = looseBeads ? Number(quantity) : 1
    const error = addLine({
      productId: product.id,
      beadSize: product.beadSize,
      productName: product.name,
      presentationLabel: selected?.label ?? 'Presentación',
      priceCents: selectedPrice,
      unit: selectedUnit,
      stockQty: product.stockQty,
      quantity: qty,
      threadColor: heroImage ? null : threadColor,
    })
    if (error) {
      setCartMessage(error)
      return
    }
    setCartMessage('Agregado al carrito.')
    openDrawer()
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="aspect-[4/5] sm:aspect-square">
          {heroImage ? (
            <img
              src={heroImage}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : (
            <BeadViewerSuspense
              beadSize={product.beadSize}
              threadColor={threadColor}
              interactive
              autoRotate
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Oro 18k
            {product.approxMm ? ` · ~${product.approxMm} mm` : null}
          </p>
          <h1 className="text-base font-medium text-balance text-foreground">
            {product.name}
          </h1>
          <p className="text-sm font-medium tabular-nums text-foreground">
            {formatPresentationPrice(
              selected?.priceCents ?? product.priceCents,
              selected?.unit ?? (product.priceCents === null ? null : 'c/u'),
            )}
          </p>
          <p
            className={`text-xs ${soldOut ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            Stock balines: {formatStockLabel(product.stockQty)}
          </p>
        </div>

        {product.description ? (
          <p className="text-sm text-pretty text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        {!heroImage ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Color de hilo
            </p>
            <div className="flex flex-wrap gap-2">
              {THREAD_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={threadColor === option.id ? 'default' : 'outline'}
                  onClick={() => setThreadColor(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Presentaciones
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {presentations.map((item, index) => (
              <PresentationCard
                key={`${item.label}-${index}`}
                item={item}
                selected={index === selectedIndex}
                onSelect={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </div>

        <Card size="sm">
          <CardHeader>
            <CardDescription className="text-xs">Agregar al pedido</CardDescription>
            <CardTitle className="text-sm tabular-nums">
              {formatPresentationPrice(selectedPrice, selectedUnit)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {looseBeads ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cart-qty" className="text-xs">
                  Cantidad de balines
                </Label>
                <Input
                  id="cart-qty"
                  inputMode="numeric"
                  className="max-w-28 tabular-nums"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!canAdd}
                onClick={onAddToCart}
              >
                Agregar al carrito
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openDrawer}
              >
                Ver carrito
              </Button>
              {blockedReason && !canAdd ? (
                <span className="text-xs text-muted-foreground text-pretty">
                  {blockedReason}
                </span>
              ) : null}
              {cartMessage ? (
                <span
                  className={`text-xs ${
                    cartMessage === 'Agregado al carrito.'
                      ? 'text-muted-foreground'
                      : 'text-destructive'
                  }`}
                >
                  {cartMessage}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProductDetail({ beadSizeParam }: ProductDetailProps) {
  const beadSizeNumber = Number(beadSizeParam)
  const beadSize: BeadSize | null = isBeadSize(beadSizeNumber)
    ? beadSizeNumber
    : null
  const { data, isLoading, isError, error } = useProduct(beadSize)

  if (beadSize === null) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-destructive">Tamaño no válido.</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Volver al catálogo
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudo cargar el producto.'}
      </p>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Producto no encontrado.</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Volver al catálogo
        </Button>
      </div>
    )
  }

  return <DetailContent product={data} />
}
