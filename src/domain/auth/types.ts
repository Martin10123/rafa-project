export const ROLES = ['customer', 'admin'] as const

export type Role = (typeof ROLES)[number]

export type Profile = {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
}

export function isAdminRole(role: Role | null | undefined): boolean {
  return role === 'admin'
}
