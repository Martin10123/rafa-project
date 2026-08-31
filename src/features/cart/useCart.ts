import {
  cartItemCount,
  cartSubtotalCents,
  formatCartSubtotal,
} from '@/domain/cart/types'
import { useCartStore } from '@/features/cart/cart-store'

export function useCartLines() {
  return useCartStore((state) => state.lines)
}

export function useCartItemCount() {
  return useCartStore((state) => cartItemCount(state.lines))
}

export function useCartSubtotal() {
  return useCartStore((state) => cartSubtotalCents(state.lines))
}

export function useCartSubtotalLabel() {
  return useCartStore((state) => formatCartSubtotal(state.lines))
}

export function useCartActions() {
  const addLine = useCartStore((state) => state.addLine)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeLine = useCartStore((state) => state.removeLine)
  const clearCart = useCartStore((state) => state.clearCart)

  return { addLine, setQuantity, removeLine, clearCart }
}
