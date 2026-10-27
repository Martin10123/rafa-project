const PENDING_ORDER_KEY = 'rafa-pending-order'

export function savePendingOrderId(orderId: string) {
  localStorage.setItem(PENDING_ORDER_KEY, orderId)
}

export function readPendingOrderId(): string | null {
  return localStorage.getItem(PENDING_ORDER_KEY)
}
