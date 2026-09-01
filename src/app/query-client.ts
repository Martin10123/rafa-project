import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { logEventSafe } from '@/shared/logging'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido'
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        logEventSafe({
          category: 'catalog',
          level: 'warn',
          eventType: 'query_error',
          success: false,
          message: errorMessage(error),
          detail: {
            queryKey: query.queryKey,
          },
        })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        logEventSafe({
          category: 'system',
          level: 'error',
          eventType: 'mutation_error',
          success: false,
          message: errorMessage(error),
          detail: {
            mutationKey: mutation.options.mutationKey,
          },
        })
      },
    }),
  })
}
