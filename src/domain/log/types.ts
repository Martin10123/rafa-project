export const LOG_CATEGORIES = [
  'auth',
  'cart',
  'checkout',
  'orders',
  'inventory',
  'gallery',
  'catalog',
  'storage',
  'system',
] as const

export type LogCategory = (typeof LOG_CATEGORIES)[number]

export const LOG_LEVELS = ['info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type EventLogEntry = {
  id: string
  category: LogCategory | string
  level: LogLevel | string
  eventType: string
  success: boolean
  message: string | null
  email: string | null
  userId: string | null
  entityType: string | null
  entityId: string | null
  detail: Record<string, unknown>
  route: string | null
  userAgent: string | null
  createdAt: string
}

export type CreateEventLogInput = {
  category: LogCategory | string
  level?: LogLevel
  eventType: string
  success?: boolean
  message?: string | null
  email?: string | null
  userId?: string | null
  entityType?: string | null
  entityId?: string | null
  detail?: Record<string, unknown>
  route?: string | null
}

export type EventLogFilters = {
  category?: LogCategory | ''
  level?: LogLevel | ''
  success?: boolean | ''
  email?: string
  limit?: number
}

export function categoryLabel(category: string): string {
  switch (category) {
    case 'auth':
      return 'Auth'
    case 'cart':
      return 'Carrito'
    case 'checkout':
      return 'Checkout'
    case 'orders':
      return 'Pedidos'
    case 'inventory':
      return 'Inventario'
    case 'gallery':
      return 'Galería'
    case 'catalog':
      return 'Catálogo'
    case 'storage':
      return 'Storage'
    case 'system':
      return 'Sistema'
    default:
      return category
  }
}

export function levelLabel(level: string): string {
  switch (level) {
    case 'info':
      return 'Info'
    case 'warn':
      return 'Aviso'
    case 'error':
      return 'Error'
    default:
      return level
  }
}

export function eventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    signup_attempt: 'Registro intentado',
    signup_success: 'Registro exitoso',
    signup_confirm_pending: 'Falta confirmar correo',
    signup_error: 'Error al registrarse',
    login_attempt: 'Login intentado',
    login_success: 'Login exitoso',
    login_error: 'Error al entrar',
    logout: 'Sesión cerrada',
    session_change: 'Cambio de sesión',
    cart_add_success: 'Agregado al carrito',
    cart_add_rejected: 'Carrito rechazado',
    cart_clear: 'Carrito vaciado',
    checkout_order_created: 'Pedido creado',
    checkout_order_error: 'Error al crear pedido',
    checkout_proof_submitted: 'Comprobante enviado',
    checkout_proof_error: 'Error al subir comprobante',
    order_payment_approved: 'Pago aprobado',
    order_payment_rejected: 'Pago rechazado',
    inventory_movement_created: 'Movimiento de inventario',
    inventory_movement_error: 'Error en inventario',
    gallery_showcase_created: 'Collage creado',
    gallery_showcase_updated: 'Collage actualizado',
    gallery_showcase_deleted: 'Collage eliminado',
    gallery_image_uploaded: 'Imagen subida',
    gallery_image_error: 'Error al subir imagen',
    catalog_load_error: 'Error al cargar catálogo',
    query_error: 'Error de consulta',
    mutation_error: 'Error de mutación',
    uncaught_error: 'Error no capturado',
  }
  return labels[eventType] ?? eventType
}

export function resolveLogLevel(input: CreateEventLogInput): LogLevel {
  if (input.level) return input.level
  if (input.success === false) return 'error'
  if (input.eventType.includes('error') || input.eventType.includes('rejected')) {
    return 'error'
  }
  if (input.eventType.includes('warn')) return 'warn'
  return 'info'
}
