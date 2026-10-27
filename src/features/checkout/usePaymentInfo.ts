import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getStorePaymentInfo,
  updateStorePaymentInfo,
} from '@/data/repositories/payment-info'
import type { StorePaymentInfo } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'

export const paymentInfoKey = ['payment-info'] as const

export function usePaymentInfo() {
  return useQuery({
    queryKey: paymentInfoKey,
    queryFn: getStorePaymentInfo,
    enabled: isSupabaseConfigured(),
  })
}

export function useUpdatePaymentInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StorePaymentInfo) => updateStorePaymentInfo(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentInfoKey })
    },
  })
}
