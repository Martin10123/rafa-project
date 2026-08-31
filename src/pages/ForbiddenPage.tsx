import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-8">
      <p className="text-xs font-medium text-muted-foreground uppercase">Acceso</p>
      <h1 className="text-base font-medium text-foreground">Sin acceso</h1>
      <p className="text-sm text-muted-foreground text-pretty">
        Esta sección es solo para Rafa.
      </p>
      <div>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Volver a la tienda
        </Button>
      </div>
    </section>
  )
}
