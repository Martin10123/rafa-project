import { CatalogGrid } from '@/features/catalog/CatalogGrid'
import { CatalogHero3D } from '@/features/scene3d/CatalogHero3D'

export function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium tracking-[0.22em] text-sky-200 uppercase">
            Colección
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Catálogo de balines en oro 18k
          </h1>
          <p className="max-w-lg text-sm text-pretty text-sky-100/75 sm:text-base">
            Elige el tamaño, mira el precio y arma el pedido. Puedes mirar sin
            cuenta.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-sky-100">
              #3 a #8
            </span>
            <span className="rounded-full border border-yellow-200/30 bg-yellow-300/15 px-3 py-1 text-yellow-100">
              Precios en COP
            </span>
          </div>
        </div>
        <CatalogHero3D />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Precios por tamaño
        </h2>
        <CatalogGrid />
      </div>
    </section>
  )
}
