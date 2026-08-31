import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartItemCount } from '@/features/cart/useCart'
import { useCartUiStore } from '@/features/cart/cart-ui-store'

export function CartNavButton() {
  const count = useCartItemCount()
  const openDrawer = useCartUiStore((state) => state.openDrawer)

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="relative"
      aria-label={count > 0 ? `Carrito, ${count} artículos` : 'Carrito'}
      onClick={openDrawer}
    >
      <ShoppingBag className="size-4" aria-hidden />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground tabular-nums">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Button>
  )
}
