import type { CreateAuthLogInput } from '@/domain/auth/log-types'
import { logEventSafe as baseLogEventSafe } from '@/data/repositories/event-logs'
import type { CreateEventLogInput } from '@/domain/log/types'
import { listEventLogs } from '@/data/repositories/event-logs'
import type { EventLogFilters } from '@/domain/log/types'

export function logAuthEventSafe(input: CreateAuthLogInput): void {
  baseLogEventSafe({
    category: 'auth',
    eventType: input.eventType,
    success: input.success,
    message: input.message,
    email: input.email,
    userId: input.userId,
    detail: input.detail,
  })
}

export async function listAuthEventLogs(limit = 100) {
  return listEventLogs({ category: 'auth', limit })
}

export { logEventSafe } from '@/data/repositories/event-logs'
export type { CreateEventLogInput, EventLogFilters }
