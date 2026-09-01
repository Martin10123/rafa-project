import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured } from '@/data/supabase/client'
import {
  LOG_CATEGORIES,
  LOG_LEVELS,
  categoryLabel,
  eventTypeLabel,
  levelLabel,
  type EventLogFilters,
  type LogCategory,
  type LogLevel,
} from '@/domain/log/types'
import { useEventLogs } from '@/features/logs/useEventLogs'

export function EventLogsPanel() {
  const [category, setCategory] = useState<LogCategory | ''>('')
  const [level, setLevel] = useState<LogLevel | ''>('')
  const [success, setSuccess] = useState<boolean | ''>('')
  const [email, setEmail] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filters: EventLogFilters = {
    category,
    level,
    success,
    email: email.trim() || undefined,
    limit: 150,
  }

  const logsQuery = useEventLogs(filters)

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para ver los logs.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-category" className="text-xs">
            Categoría
          </Label>
          <select
            id="log-category"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as LogCategory | '')
            }
          >
            <option value="">Todas</option>
            {LOG_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {categoryLabel(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-level" className="text-xs">
            Nivel
          </Label>
          <select
            id="log-level"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={level}
            onChange={(event) => setLevel(event.target.value as LogLevel | '')}
          >
            <option value="">Todos</option>
            {LOG_LEVELS.map((item) => (
              <option key={item} value={item}>
                {levelLabel(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-success" className="text-xs">
            Resultado
          </Label>
          <select
            id="log-success"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={success === '' ? '' : success ? 'ok' : 'error'}
            onChange={(event) => {
              const value = event.target.value
              setSuccess(value === '' ? '' : value === 'ok')
            }}
          >
            <option value="">Todos</option>
            <option value="ok">OK</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-email" className="text-xs">
            Correo
          </Label>
          <Input
            id="log-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Buscar…"
          />
        </div>
      </div>

      {logsQuery.isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : logsQuery.isError ? (
        <p className="text-sm text-destructive text-pretty">
          {logsQuery.error instanceof Error
            ? logsQuery.error.message
            : 'No se pudieron cargar los logs.'}
        </p>
      ) : !logsQuery.data?.length ? (
        <p className="text-sm text-muted-foreground">
          No hay eventos con estos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Cat.</th>
                <th className="px-3 py-2 font-medium">Nivel</th>
                <th className="px-3 py-2 font-medium">Evento</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">Mensaje</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {logsQuery.data.map((log) => (
                <Fragment key={log.id}>
                  <tr className="border-b align-top">
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {categoryLabel(log.category)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {levelLabel(log.level)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {eventTypeLabel(log.eventType)}
                    </td>
                    <td className="px-3 py-2 text-xs">{log.email ?? '—'}</td>
                    <td className="max-w-xs px-3 py-2 text-xs text-muted-foreground text-pretty">
                      {log.message ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpandedId(expandedId === log.id ? null : log.id)
                        }
                      >
                        {expandedId === log.id ? 'Ocultar' : 'Detalle'}
                      </Button>
                    </td>
                  </tr>
                  {expandedId === log.id ? (
                    <tr key={`${log.id}-detail`} className="border-b bg-muted/20">
                      <td colSpan={7} className="px-3 py-2">
                        <pre className="overflow-x-auto text-xs text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              route: log.route,
                              entityType: log.entityType,
                              entityId: log.entityId,
                              success: log.success,
                              detail: log.detail,
                            },
                            null,
                            2,
                          )}
                        </pre>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
