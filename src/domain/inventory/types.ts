export type MovementType = 'in' | 'out' | 'reserve' | 'release' | 'adjust'

export type StockRow = {
  productId: string
  beadSize: number
  name: string
  physicalQty: number
  reservedQty: number
  availableQty: number
}

export type InventoryMovement = {
  id: string
  productId: string
  beadSize: number | null
  productName: string | null
  type: MovementType
  quantity: number
  occurredAt: string
  source: string
  notes: string | null
}

export type CreateMovementInput = {
  productId: string
  type: 'in' | 'adjust'
  quantity: number
  occurredAt: string
  notes?: string
}

export function movementTypeLabel(type: MovementType): string {
  switch (type) {
    case 'in':
      return 'Entrada'
    case 'out':
      return 'Salida'
    case 'reserve':
      return 'Reserva'
    case 'release':
      return 'Liberación'
    case 'adjust':
      return 'Ajuste / merma'
  }
}
