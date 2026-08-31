import { useParams } from 'react-router'
import { ProductDetail } from '@/features/catalog/ProductDetail'

export function ProductPage() {
  const { beadSize = '' } = useParams()

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <ProductDetail beadSizeParam={beadSize} />
    </section>
  )
}
