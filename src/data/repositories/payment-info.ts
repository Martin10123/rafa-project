import type { StorePaymentInfo } from '@/domain/order/types'
import { supabase } from '@/data/supabase/client'

type PaymentInfoRow = {
  bank_name: string
  account_type: string
  account_number: string
  holder_name: string
}

function assertClient() {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }
  return supabase
}

function mapPaymentInfo(row: PaymentInfoRow): StorePaymentInfo {
  return {
    bankName: row.bank_name,
    accountType: row.account_type,
    accountNumber: row.account_number,
    holderName: row.holder_name,
  }
}

export async function getStorePaymentInfo(): Promise<StorePaymentInfo | null> {
  const client = assertClient()

  const { data, error } = await client
    .from('store_payment_info')
    .select('bank_name, account_type, account_number, holder_name')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapPaymentInfo(data as PaymentInfoRow)
}

export async function updateStorePaymentInfo(
  input: StorePaymentInfo,
): Promise<StorePaymentInfo> {
  const client = assertClient()

  const { data, error } = await client
    .from('store_payment_info')
    .update({
      bank_name: input.bankName.trim(),
      account_type: input.accountType.trim(),
      account_number: input.accountNumber.trim(),
      holder_name: input.holderName.trim(),
    })
    .eq('id', 1)
    .select('bank_name, account_type, account_number, holder_name')
    .single()

  if (error) throw new Error(error.message)
  return mapPaymentInfo(data as PaymentInfoRow)
}
