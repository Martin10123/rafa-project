import type {
  CreateEventLogInput,
  EventLogEntry,
  EventLogFilters,
  LogLevel,
} from '@/domain/log/types'
import { resolveLogLevel } from '@/domain/log/types'
import { supabase } from '@/data/supabase/client'

type LogRow = {
  id: string
  category: string
  level: string
  event_type: string
  success: boolean
  message: string | null
  email: string | null
  user_id: string | null
  entity_type: string | null
  entity_id: string | null
  detail: Record<string, unknown> | null
  route: string | null
  user_agent: string | null
  created_at: string
}

const LOG_COLUMNS =
  'id, category, level, event_type, success, message, email, user_id, entity_type, entity_id, detail, route, user_agent, created_at'

function currentRoute(): string | null {
  if (typeof window === 'undefined') return null
  return window.location.pathname
}

function mapLog(row: LogRow): EventLogEntry {
  return {
    id: row.id,
    category: row.category,
    level: row.level,
    eventType: row.event_type,
    success: row.success,
    message: row.message,
    email: row.email,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    detail: row.detail ?? {},
    route: row.route,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }
}

export async function logEvent(input: CreateEventLogInput): Promise<void> {
  if (!supabase) return

  const level: LogLevel = resolveLogLevel(input)

  const { error } = await supabase.from('app_event_logs').insert({
    category: input.category,
    level,
    event_type: input.eventType,
    success: input.success ?? level !== 'error',
    message: input.message ?? null,
    email: input.email ?? null,
    user_id: input.userId ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    detail: input.detail ?? {},
    route: input.route ?? currentRoute(),
    user_agent:
      typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 512) : null,
  })

  if (error) {
    console.warn('No se pudo guardar log:', error.message)
  }
}

export function logEventSafe(input: CreateEventLogInput): void {
  void logEvent(input)
}

export async function listEventLogs(
  filters: EventLogFilters = {},
): Promise<EventLogEntry[]> {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }

  let query = supabase
    .from('app_event_logs')
    .select(LOG_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 150)

  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.level) {
    query = query.eq('level', filters.level)
  }
  if (filters.success === true) {
    query = query.eq('success', true)
  }
  if (filters.success === false) {
    query = query.eq('success', false)
  }
  if (filters.email?.trim()) {
    query = query.ilike('email', `%${filters.email.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as LogRow[]).map(mapLog)
}
