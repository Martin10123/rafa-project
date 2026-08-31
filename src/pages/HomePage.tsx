import { CatalogGrid } from '@/features/catalog/CatalogGrid'

export function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Colección
        </p>
        <h1 className="text-base font-medium text-balance text-foreground">
          Catálogo de balines
        </h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Elige el tamaño. Puedes mirar sin cuenta; entrar es opcional para
          historial y promociones.
        </p>
      </div>
      <CatalogGrid />
    </section>
  )
}
