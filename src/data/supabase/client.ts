import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

export function isSupabaseConfigured(): boolean {
  return url.length > 0 && publishableKey.length > 0
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url, publishableKey)
  : null
