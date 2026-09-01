import { Link, useRouteError, isRouteErrorResponse } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col px-4 py-12">
      <Card>
        <CardHeader className="gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Error
          </p>
          <CardTitle className="text-base">Página no encontrada</CardTitle>
          <CardDescription className="text-sm text-pretty">
            La ruta que buscas no existe o fue movida.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  const is404 = isRouteErrorResponse(error) && error.status === 404
  const message = isRouteErrorResponse(error)
    ? error.statusText || error.data
    : error instanceof Error
      ? error.message
      : 'Ocurrió un error inesperado.'

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col px-4 py-12">
      <Card>
        <CardHeader className="gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Error
          </p>
          <CardTitle className="text-base">
            {is404 ? 'Página no encontrada' : 'Algo salió mal'}
          </CardTitle>
          <CardDescription className="text-sm text-pretty">
            {is404
              ? 'La ruta que buscas no existe o fue movida.'
              : String(message)}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
