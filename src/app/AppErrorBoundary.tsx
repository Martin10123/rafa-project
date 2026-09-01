import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { logEventSafe } from '@/shared/logging'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logEventSafe({
      category: 'system',
      level: 'error',
      eventType: 'uncaught_error',
      success: false,
      message: error.message,
      detail: {
        componentStack: info.componentStack?.slice(0, 2000),
        name: error.name,
      },
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center gap-3 px-4 py-8">
          <p className="text-base font-medium text-foreground">
            Algo salió mal
          </p>
          <p className="text-sm text-pretty text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              this.setState({ error: null })
              window.location.assign('/')
            }}
          >
            Volver al inicio
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
