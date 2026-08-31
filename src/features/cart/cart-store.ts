import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  cartLineKey,
  isLooseBeadUnit,
  validateAddToCart,
  type AddCartLineInput,
  type CartLine,
} from '@/domain/cart/types'

type CartState = {
  lines: CartLine[]
  addLine: (input: AddCartLineInput) => string | null
  setQuantity: (lineId: string, quantity: number, stockQty: number) => void
  removeLine: (lineId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addLine(input) {
        const validation = validateAddToCart(input)
        if (!validation.ok) return validation.message

        const quantity = input.quantity ?? 1
        const threadColor = input.threadColor ?? null
        const key = cartLineKey({
          productId: input.productId,
          presentationLabel: input.presentationLabel,
          threadColor,
        })

        const existing = get().lines.find((line) => cartLineKey(line) === key)

        if (existing && isLooseBeadUnit(input.unit)) {
          const nextQty = existing.quantity + quantity
          if (nextQty > input.stockQty) {
            return `Solo hay ${input.stockQty} balines disponibles.`
          }

          set({
            lines: get().lines.map((line) =>
              line.id === existing.id ? { ...line, quantity: nextQty } : line,
            ),
          })
          return null
        }

        if (existing) {
          return 'Esta presentación ya está en el carrito.'
        }

        const line: CartLine = {
          id: crypto.randomUUID(),
          productId: input.productId,
          beadSize: input.beadSize,
          productName: input.productName,
          presentationLabel: input.presentationLabel,
          priceCents: input.priceCents!,
          unit: input.unit,
          quantity,
          threadColor,
        }

        set({ lines: [...get().lines, line] })
        return null
      },

      setQuantity(lineId, quantity, stockQty) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          set({ lines: get().lines.filter((line) => line.id !== lineId) })
          return
        }

        set({
          lines: get().lines.map((line) => {
            if (line.id !== lineId) return line
            const max = isLooseBeadUnit(line.unit) ? stockQty : 1
            return { ...line, quantity: Math.min(quantity, max) }
          }),
        })
      },

      removeLine(lineId) {
        set({ lines: get().lines.filter((line) => line.id !== lineId) })
      },

      clearCart() {
        set({ lines: [] })
      },
    }),
    {
      name: 'rafa-cart',
      version: 1,
    },
  ),
)
