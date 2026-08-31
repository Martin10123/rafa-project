import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProductByBeadSize,
  listAdminProducts,
  listCatalogProducts,
  updateProductPrice,
} from '@/data/repositories/products'
import type { BeadSize } from '@/domain/product/types'
import { isSupabaseConfigured } from '@/data/supabase/client'

export const productKeys = {
  all: ['products'] as const,
  catalog: () => [...productKeys.all, 'catalog'] as const,
  detail: (beadSize: BeadSize) => [...productKeys.all, 'detail', beadSize] as const,
  admin: () => [...productKeys.all, 'admin'] as const,
}

export function useCatalogProducts() {
  return useQuery({
    queryKey: productKeys.catalog(),
    queryFn: listCatalogProducts,
    enabled: isSupabaseConfigured(),
  })
}

export function useProduct(beadSize: BeadSize | null) {
  return useQuery({
    queryKey: productKeys.detail(beadSize ?? 3),
    queryFn: () => getProductByBeadSize(beadSize!),
    enabled: isSupabaseConfigured() && beadSize !== null,
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.admin(),
    queryFn: listAdminProducts,
    enabled: isSupabaseConfigured(),
  })
}

export function useUpdateProductPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      priceCents,
    }: {
      productId: string
      priceCents: number | null
    }) => updateProductPrice(productId, priceCents),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
