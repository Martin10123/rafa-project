import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createStoreOrder,
  listPendingPaymentReviews,
  reviewPaymentProof,
  submitPaymentProof,
} from '@/data/repositories/orders'
import type { CreateOrderInput } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { inventoryKeys } from '@/features/inventory/useInventory'
import { productKeys } from '@/features/catalog/useProducts'

export const orderKeys = {
  all: ['orders'] as const,
  pendingReviews: () => [...orderKeys.all, 'pending-reviews'] as const,
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createStoreOrder(input),
  })
}

export function useSubmitPaymentProof() {
  return useMutation({
    mutationFn: ({ orderId, file }: { orderId: string; file: File }) =>
      submitPaymentProof(orderId, file),
  })
}

export function usePendingPaymentReviews() {
  return useQuery({
    queryKey: orderKeys.pendingReviews(),
    queryFn: listPendingPaymentReviews,
    enabled: isSupabaseConfigured(),
  })
}

export function useReviewPaymentProof() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      proofId,
      approve,
      rejectionReason,
    }: {
      proofId: string
      approve: boolean
      rejectionReason?: string
    }) => reviewPaymentProof(proofId, approve, rejectionReason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })
}
