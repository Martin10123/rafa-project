import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createInventoryMovement,
  listInventoryMovements,
  listStockAvailable,
} from '@/data/repositories/inventory'
import type { CreateMovementInput } from '@/domain/inventory/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { productKeys } from '@/features/catalog/useProducts'
import { useAuth } from '@/features/auth/useAuth'

export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: () => [...inventoryKeys.all, 'stock'] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
}

export function useStockAvailable() {
  return useQuery({
    queryKey: inventoryKeys.stock(),
    queryFn: listStockAvailable,
    enabled: isSupabaseConfigured(),
  })
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: inventoryKeys.movements(),
    queryFn: () => listInventoryMovements(80),
    enabled: isSupabaseConfigured(),
  })
}

export function useCreateInventoryMovement() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: CreateMovementInput) =>
      createInventoryMovement(input, user?.id ?? null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })
}
