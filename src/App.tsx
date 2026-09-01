import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { AppErrorBoundary } from '@/app/AppErrorBoundary'
import { createAppQueryClient } from '@/app/query-client'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'

const queryClient = createAppQueryClient()

export default function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}
