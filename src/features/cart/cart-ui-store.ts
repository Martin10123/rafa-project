import { create } from 'zustand'

type CartUiState = {
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
  setOpen: (open: boolean) => void
}

export const useCartUiStore = create<CartUiState>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  setOpen: (open) => set({ open }),
}))
