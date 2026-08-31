import { useParams } from 'react-router'
import { ShowcaseDetailView } from '@/features/gallery/ShowcaseGrid'

export function GalleryDetailPage() {
  const { showcaseId } = useParams()
  const id = showcaseId ?? ''

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <ShowcaseDetailView showcaseId={id} />
    </section>
  )
}
