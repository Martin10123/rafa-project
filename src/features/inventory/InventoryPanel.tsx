import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { movementTypeLabel } from '@/domain/inventory/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { logEventSafe } from '@/shared/logging'
import {
  useCreateInventoryMovement,
  useInventoryMovements,
  useStockAvailable,
} from '@/features/inventory/useInventory'
import { useAdminProducts } from '@/features/catalog/useProducts'

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function InventoryPanel() {
  const stockQuery = useStockAvailable()
  const movementsQuery = useInventoryMovements()
  const productsQuery = useAdminProducts()
  const createMovement = useCreateInventoryMovement()

  const [productId, setProductId] = useState('')
  const [type, setType] = useState<'in' | 'adjust'>('in')
  const [quantity, setQuantity] = useState('1')
  const [occurredAt, setOccurredAt] = useState(() => toLocalInputValue(new Date()))
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | undefined>()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    const qty = Number(quantity)
    if (!productId) {
      setMessage('Elige un tamaño.')
      return
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      setMessage('La cantidad debe ser un entero mayor a 0.')
      return
    }

    const occurred = new Date(occurredAt)
    if (Number.isNaN(occurred.getTime())) {
      setMessage('Fecha inválida.')
      return
    }

    try {
      await createMovement.mutateAsync({
        productId,
        type,
        quantity: qty,
        occurredAt: occurred.toISOString(),
        notes,
      })
      logEventSafe({
        category: 'inventory',
        eventType: 'inventory_movement_created',
        success: true,
        message: type === 'in' ? 'Entrada registrada' : 'Ajuste registrado',
        entityType: 'product',
        entityId: productId,
        detail: { type, quantity: qty },
      })
      setQuantity('1')
      setNotes('')
      setMessage(type === 'in' ? 'Entrada registrada.' : 'Ajuste registrado.')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo guardar.'
      logEventSafe({
        category: 'inventory',
        eventType: 'inventory_movement_error',
        success: false,
        message: msg,
        entityType: 'product',
        entityId: productId || undefined,
      })
      setMessage(msg)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para usar el inventario.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Stock actual</h2>
        {stockQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        ) : stockQuery.isError ? (
          <p className="text-sm text-destructive text-pretty">
            {stockQuery.error instanceof Error
              ? stockQuery.error.message
              : 'No se pudo cargar el stock.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Tamaño</th>
                  <th className="px-3 py-2 font-medium">Físico</th>
                  <th className="px-3 py-2 font-medium">Reservado</th>
                  <th className="px-3 py-2 font-medium">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {stockQuery.data?.map((row) => (
                  <tr key={row.productId} className="border-b last:border-0">
                    <td className="px-3 py-2">#{row.beadSize}</td>
                    <td className="px-3 py-2 tabular-nums">{row.physicalQty}</td>
                    <td className="px-3 py-2 tabular-nums">{row.reservedQty}</td>
                    <td
                      className={`px-3 py-2 tabular-nums ${
                        row.availableQty <= 0 ? 'text-destructive' : ''
                      }`}
                    >
                      {row.availableQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Registrar movimiento</h2>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-product" className="text-xs">
              Producto
            </Label>
            <select
              id="inv-product"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              required
            >
              <option value="">Selecciona…</option>
              {productsQuery.data?.map((product) => (
                <option key={product.id} value={product.id}>
                  #{product.beadSize} — {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-type" className="text-xs">
              Tipo
            </Label>
            <select
              id="inv-type"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={type}
              onChange={(event) =>
                setType(event.target.value === 'adjust' ? 'adjust' : 'in')
              }
            >
              <option value="in">Entrada</option>
              <option value="adjust">Ajuste / merma</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-qty" className="text-xs">
              Cantidad
            </Label>
            <Input
              id="inv-qty"
              inputMode="numeric"
              className="tabular-nums"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-date" className="text-xs">
              Fecha
            </Label>
            <Input
              id="inv-date"
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="inv-notes" className="text-xs">
              Nota
            </Label>
            <Input
              id="inv-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. compra proveedor, merma, etc."
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Button type="submit" size="sm" disabled={createMovement.isPending}>
              Guardar movimiento
            </Button>
            {message ? (
              <span className="text-xs text-muted-foreground">{message}</span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Historial (kardex)</h2>
        {movementsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        ) : movementsQuery.isError ? (
          <p className="text-sm text-destructive text-pretty">
            {movementsQuery.error instanceof Error
              ? movementsQuery.error.message
              : 'No se pudo cargar el historial.'}
          </p>
        ) : !movementsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay movimientos.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Tamaño</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Cant.</th>
                  <th className="px-3 py-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {movementsQuery.data.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(row.occurredAt).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-2">
                      {row.beadSize !== null ? `#${row.beadSize}` : '—'}
                    </td>
                    <td className="px-3 py-2">{movementTypeLabel(row.type)}</td>
                    <td className="px-3 py-2 tabular-nums">{row.quantity}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {row.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
