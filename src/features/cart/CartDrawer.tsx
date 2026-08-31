import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { CartPanel } from '@/features/cart/CartPanel'
import { useCartUiStore } from '@/features/cart/cart-ui-store'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const open = useCartUiStore((state) => state.open)
  const setOpen = useCartUiStore((state) => state.setOpen)
  const closeDrawer = useCartUiStore((state) => state.closeDrawer)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          data-slot="sheet-content"
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-lg outline-none',
            'data-open:animate-in data-open:slide-in-from-right data-open:duration-200',
            'data-closed:animate-out data-closed:slide-out-to-right data-closed:duration-200',
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="text-base">Carrito</DialogTitle>
              <DialogDescription className="text-xs">
                Revisa tu pedido sin salir de la página.
              </DialogDescription>
            </DialogHeader>
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cerrar carrito"
                />
              }
            >
              <XIcon />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <CartPanel onClose={closeDrawer} />
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
