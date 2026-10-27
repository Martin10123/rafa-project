import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelStoreOrder,
  createStoreOrder,
  getCheckoutOrder,
  listAdminOrders,
  listMyOrders,
  listPendingPaymentReviews,
  markOrderDelivered,
  reviewPaymentProof,
  setOrderAdminNotes,
  submitPaymentProof,
} from '@/data/repositories/orders'
import type { CreateOrderInput, OrderStatus } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { inventoryKeys } from '@/features/inventory/useInventory'
import { productKeys } from '@/features/catalog/useProducts'

export const orderKeys = {
  all: ['orders'] as const,
  pendingReviews: () => [...orderKeys.all, 'pending-reviews'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  admin: (status: OrderStatus | '') => [...orderKeys.all, 'admin', status] as const,
  checkout: (orderId: string) => [...orderKeys.all, 'checkout', orderId] as const,
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createStoreOrder(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
      ])
    },
  })
}

export function useSubmitPaymentProof() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, file }: { orderId: string; file: File }) =>
      submitPaymentProof(orderId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useCheckoutOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.checkout(orderId),
    queryFn: () => getCheckoutOrder(orderId),
    enabled: isSupabaseConfigured() && orderId.length > 0,
  })
}

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.mine(),
    queryFn: listMyOrders,
    enabled: isSupabaseConfigured(),
  })
}

export function useAdminOrders(status: OrderStatus | '') {
  return useQuery({
    queryKey: orderKeys.admin(status),
    queryFn: () => listAdminOrders(status || undefined),
    enabled: isSupabaseConfigured(),
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => cancelStoreOrder(orderId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })
}

export function useMarkOrderDelivered() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => markOrderDelivered(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useSetOrderAdminNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes: string }) =>
      setOrderAdminNotes(orderId, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
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
