import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logEventSafe } from '@/shared/logging'
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
        if (!validation.ok) {
          logEventSafe({
            category: 'cart',
            eventType: 'cart_add_rejected',
            success: false,
            message: validation.message,
            detail: {
              productId: input.productId,
              presentationLabel: input.presentationLabel,
            },
          })
          return validation.message
        }

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
            const message = `Solo hay ${input.stockQty} balines disponibles.`
            logEventSafe({
              category: 'cart',
              eventType: 'cart_add_rejected',
              success: false,
              message,
              detail: { productId: input.productId, requested: nextQty },
            })
            return message
          }

          set({
            lines: get().lines.map((line) =>
              line.id === existing.id ? { ...line, quantity: nextQty } : line,
            ),
          })
          return null
        }

        if (existing) {
          const message = 'Esta presentación ya está en el carrito.'
          logEventSafe({
            category: 'cart',
            level: 'warn',
            eventType: 'cart_add_rejected',
            success: false,
            message,
          })
          return message
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
        logEventSafe({
          category: 'cart',
          eventType: 'cart_add_success',
          success: true,
          message: 'Producto agregado al carrito',
          entityType: 'product',
          entityId: input.productId,
          detail: {
            beadSize: input.beadSize,
            presentationLabel: input.presentationLabel,
            quantity,
          },
        })
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
        logEventSafe({
          category: 'cart',
          eventType: 'cart_clear',
          success: true,
          message: 'Carrito vaciado',
        })
      },
    }),
    {
      name: 'rafa-cart',
      version: 1,
    },
  ),
)
