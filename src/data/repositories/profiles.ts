import type { Profile, Role } from '@/domain/auth/types'
import { supabase } from '@/data/supabase/client'

function asRole(value: string | null): Role {
  return value === 'admin' ? 'admin' : 'customer'
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    role: asRole(data.role),
    full_name: data.full_name,
    phone: data.phone,
  }
}
