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
  type ProductPresentation,
} from '@/domain/product/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import {
  useAdminProducts,
  useUpdateProduct,
  useUploadProductImage,
} from '@/features/catalog/useProducts'

type PresentationDraft = {
  key: string
  label: string
  pesos: string
  loose: boolean
  imageUrl: string | null
}

function pesosField(cents: number | null): string {
  return cents === null ? '' : String(centsToPesos(cents))
}

function draftsFromProduct(product: Product): PresentationDraft[] {
  return product.presentations.map((item) => ({
    key: crypto.randomUUID(),
    label: item.label,
    pesos: pesosField(item.priceCents),
    loose: item.unit === 'c/u',
    imageUrl: item.imageUrl,
  }))
}

function parsePesos(value: string): number | null | 'invalid' {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const pesos = Number(trimmed)
  if (!Number.isFinite(pesos) || pesos < 0) return 'invalid'
  return pesosToCents(pesos)
}

function ProductEditor({ product }: { product: Product }) {
  const updateProduct = useUpdateProduct()
  const uploadImage = useUploadProductImage()
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [approxMm, setApproxMm] = useState(
    product.approxMm === null ? '' : String(product.approxMm),
  )
  const [pesos, setPesos] = useState(pesosField(product.priceCents))
  const [isActive, setIsActive] = useState(product.isActive)
  const [coverImageUrl, setCoverImageUrl] = useState(product.coverImageUrl)
  const [presentations, setPresentations] = useState(() => draftsFromProduct(product))
  const [message, setMessage] = useState<string | undefined>()

  function patchPresentation(key: string, patch: Partial<PresentationDraft>) {
    setPresentations((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  }

  async function onUpload(file: File, onUrl: (url: string) => void) {
    setMessage(undefined)
    try {
      const url = await uploadImage.mutateAsync({ productId: product.id, file })
      onUrl(url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo subir la foto.')
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setMessage('El nombre es obligatorio.')
      return
    }

    const priceCents = parsePesos(pesos)
    if (priceCents === 'invalid') {
      setMessage('El precio base no es válido.')
      return
    }

    const mmTrimmed = approxMm.trim()
    let approx: number | null = null
    if (mmTrimmed !== '') {
      approx = Number(mmTrimmed)
      if (!Number.isFinite(approx) || approx <= 0) {
        setMessage('Los milímetros no son válidos.')
        return
      }
    }

    const nextPresentations: ProductPresentation[] = []
    for (const item of presentations) {
      const label = item.label.trim()
      if (!label) {
        setMessage('Cada presentación necesita un nombre.')
        return
      }
      const itemPrice = parsePesos(item.pesos)
      if (itemPrice === 'invalid') {
        setMessage(`Precio inválido en ${label}.`)
        return
      }
      nextPresentations.push({
        label,
        priceCents: itemPrice,
        unit: item.loose ? 'c/u' : null,
        imageUrl: item.imageUrl,
      })
    }

    try {
      await updateProduct.mutateAsync({
        productId: product.id,
        name: trimmedName,
        description: description.trim() || null,
        approxMm: approx,
        priceCents,
        isActive,
        coverImageUrl,
        presentations: nextPresentations,
      })
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
          Base: {formatPriceLabel(product.priceCents)} ·{' '}
          {formatStockLabel(product.stockQty)}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`name-${product.id}`} className="text-xs">
          Nombre
        </Label>
        <Input
          id={`name-${product.id}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`desc-${product.id}`} className="text-xs">
          Descripción
        </Label>
        <textarea
          id={`desc-${product.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`mm-${product.id}`} className="text-xs">
            Milímetros
          </Label>
          <Input
            id={`mm-${product.id}`}
            inputMode="decimal"
            value={approxMm}
            onChange={(event) => setApproxMm(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`price-${product.id}`} className="text-xs">
            Precio base (COP)
          </Label>
          <Input
            id={`price-${product.id}`}
            inputMode="numeric"
            className="tabular-nums"
            value={pesos}
            onChange={(event) => setPesos(event.target.value)}
            placeholder="Vacío = por definir"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-foreground">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Visible en la tienda
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`cover-${product.id}`} className="text-xs">
          Foto de portada
        </Label>
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt=""
            className="h-24 w-full rounded-lg object-cover"
          />
        ) : null}
        <Input
          id={`cover-${product.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploadImage.isPending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void onUpload(file, setCoverImageUrl)
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Presentaciones
        </p>
        {presentations.map((item) => (
          <div key={item.key} className="flex flex-col gap-2 rounded-lg border p-3">
            <Input
              value={item.label}
              onChange={(event) =>
                patchPresentation(item.key, { label: event.target.value })
              }
              placeholder="Nombre"
              aria-label="Nombre de la presentación"
            />
            <Input
              inputMode="numeric"
              className="tabular-nums"
              value={item.pesos}
              onChange={(event) =>
                patchPresentation(item.key, { pesos: event.target.value })
              }
              placeholder="Precio COP, vacío = por definir"
              aria-label="Precio de la presentación"
            />
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={item.loose}
                onChange={(event) =>
                  patchPresentation(item.key, { loose: event.target.checked })
                }
              />
              Balín suelto (descuenta stock)
            </label>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="h-20 w-full rounded-lg object-cover"
              />
            ) : null}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploadImage.isPending}
              aria-label="Foto de la presentación"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) {
                  void onUpload(file, (url) =>
                    patchPresentation(item.key, { imageUrl: url }),
                  )
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                setPresentations((current) =>
                  current.filter((row) => row.key !== item.key),
                )
              }
            >
              Quitar presentación
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setPresentations((current) => [
              ...current,
              {
                key: crypto.randomUUID(),
                label: '',
                pesos: '',
                loose: false,
                imageUrl: null,
              },
            ])
          }
        >
          Agregar presentación
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={updateProduct.isPending}>
          Guardar
        </Button>
        {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
      </div>
    </form>
  )
}

export function AdminProductsPanel() {
  const { data, isLoading, isError, error } = useAdminProducts()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase en .env.local para editar el catálogo.
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
    <div className="grid grid-cols-1 gap-3">
      {data?.map((product) => (
        <ProductEditor key={product.id} product={product} />
      ))}
    </div>
  )
}
