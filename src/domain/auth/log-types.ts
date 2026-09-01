export const AUTH_LOG_EVENTS = [
  'signup_attempt',
  'signup_success',
  'signup_confirm_pending',
  'signup_error',
  'login_attempt',
  'login_success',
  'login_error',
  'logout',
  'session_change',
] as const

export type AuthLogEvent = (typeof AUTH_LOG_EVENTS)[number]

export type AuthLogEntry = {
  id: string
  eventType: AuthLogEvent | string
  email: string | null
  userId: string | null
  success: boolean
  message: string | null
  detail: Record<string, unknown>
  userAgent: string | null
  createdAt: string
}

export type CreateAuthLogInput = {
  eventType: AuthLogEvent | string
  email?: string | null
  userId?: string | null
  success?: boolean
  message?: string | null
  detail?: Record<string, unknown>
}

export function authLogEventLabel(eventType: string): string {
  switch (eventType) {
    case 'signup_attempt':
      return 'Registro intentado'
    case 'signup_success':
      return 'Registro exitoso'
    case 'signup_confirm_pending':
      return 'Falta confirmar correo'
    case 'signup_error':
      return 'Error al registrarse'
    case 'login_attempt':
      return 'Login intentado'
    case 'login_success':
      return 'Login exitoso'
    case 'login_error':
      return 'Error al entrar'
    case 'logout':
      return 'Sesión cerrada'
    case 'session_change':
      return 'Cambio de sesión'
    default:
      return eventType
  }
}
