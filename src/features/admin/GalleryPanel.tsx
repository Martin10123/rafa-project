import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  parseOptionalBeadSize,
  SHOWCASE_TEMPLATES,
  templateLabel,
  templateSlotCount,
  type Showcase,
  type ShowcaseTemplate,
} from '@/domain/showcase/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { CollageLayout } from '@/features/gallery/CollageLayout'
import {
  useAdminShowcases,
  useCreateShowcase,
  useDeleteShowcase,
  useDeleteShowcaseImage,
  useUpdateShowcase,
  useUploadShowcaseImage,
} from '@/features/gallery/useShowcases'

function ShowcaseEditor({ showcase }: { showcase: Showcase }) {
  const updateShowcase = useUpdateShowcase()
  const deleteShowcase = useDeleteShowcase()
  const uploadImage = useUploadShowcaseImage()
  const deleteImage = useDeleteShowcaseImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(showcase.title)
  const [caption, setCaption] = useState(showcase.caption ?? '')
  const [template, setTemplate] = useState<ShowcaseTemplate>(showcase.template)
  const [sortOrder, setSortOrder] = useState(String(showcase.sortOrder))
  const [beadSize, setBeadSize] = useState(
    showcase.beadSize === null ? '' : String(showcase.beadSize),
  )
  const [published, setPublished] = useState(showcase.isPublished)
  const [message, setMessage] = useState<string | undefined>()

  const slots = templateSlotCount(template)
  const canUpload = showcase.images.length < slots

  async function onSaveMeta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    const parsedBead = parseOptionalBeadSize(beadSize)
    if (parsedBead === 'invalid') {
      setMessage('Tamaño de balín inválido (#3–#8).')
      return
    }

    const order = Number(sortOrder)
    if (!Number.isInteger(order)) {
      setMessage('El orden debe ser un número entero.')
      return
    }

    try {
      await updateShowcase.mutateAsync({
        id: showcase.id,
        input: {
          title,
          caption,
          template,
          sortOrder: order,
          isPublished: published,
          beadSize: parsedBead,
        },
      })
      setMessage('Guardado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar.')
    }
  }

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setMessage(undefined)
    try {
      await uploadImage.mutateAsync({
        showcaseId: showcase.id,
        file,
        sortOrder: showcase.images.length,
      })
      setMessage('Foto subida.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo subir.')
    }
  }

  async function onDelete() {
    if (!window.confirm('¿Eliminar este collage?')) return
    setMessage(undefined)
    try {
      await deleteShowcase.mutateAsync(showcase.id)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar.')
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border p-4">
      <CollageLayout
        template={showcase.template}
        images={showcase.images}
        title={showcase.title}
      />

      <form onSubmit={onSaveMeta} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor={`title-${showcase.id}`} className="text-xs">
            Título
          </Label>
          <Input
            id={`title-${showcase.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor={`caption-${showcase.id}`} className="text-xs">
            Nota (opcional)
          </Label>
          <textarea
            id={`caption-${showcase.id}`}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={2}
            className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`template-${showcase.id}`} className="text-xs">
            Plantilla
          </Label>
          <select
            id={`template-${showcase.id}`}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={template}
            onChange={(event) => setTemplate(event.target.value as ShowcaseTemplate)}
          >
            {SHOWCASE_TEMPLATES.map((item) => (
              <option key={item} value={item}>
                {templateLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`order-${showcase.id}`} className="text-xs">
            Orden
          </Label>
          <Input
            id={`order-${showcase.id}`}
            inputMode="numeric"
            className="tabular-nums"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`bead-${showcase.id}`} className="text-xs">
            Balín referencia (opcional)
          </Label>
          <Input
            id={`bead-${showcase.id}`}
            inputMode="numeric"
            placeholder="Ej. 5"
            className="tabular-nums"
            value={beadSize}
            onChange={(event) => setBeadSize(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`published-${showcase.id}`} className="text-xs">
            Estado
          </Label>
          <select
            id={`published-${showcase.id}`}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={published ? 'published' : 'draft'}
            onChange={(event) => setPublished(event.target.value === 'published')}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
          <Button type="submit" size="sm" disabled={updateShowcase.isPending}>
            Guardar cambios
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={!canUpload || uploadImage.isPending}
            onChange={(event) => void onUpload(event)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canUpload || uploadImage.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Subir foto ({showcase.images.length}/{slots})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleteShowcase.isPending}
            onClick={() => void onDelete()}
          >
            Eliminar collage
          </Button>
          {message ? (
            <span className="text-xs text-muted-foreground">{message}</span>
          ) : null}
        </div>
      </form>

      {showcase.images.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {showcase.images.map((image) => (
            <li key={image.id} className="flex flex-col gap-1">
              <img
                src={image.imageUrl}
                alt={image.altText ?? showcase.title}
                className="size-16 rounded-lg object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={deleteImage.isPending}
                onClick={() => void deleteImage.mutateAsync(image)}
              >
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

function NewShowcaseForm() {
  const createShowcase = useCreateShowcase()
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState<ShowcaseTemplate>('single')
  const [message, setMessage] = useState<string | undefined>()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    try {
      await createShowcase.mutateAsync({ title, template })
      setTitle('')
      setMessage('Collage creado. Sube las fotos abajo.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear.')
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-3"
    >
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="new-showcase-title" className="text-xs">
          Nuevo collage
        </Label>
        <Input
          id="new-showcase-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Manilla premium #5"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-showcase-template" className="text-xs">
          Plantilla
        </Label>
        <select
          id="new-showcase-template"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={template}
          onChange={(event) => setTemplate(event.target.value as ShowcaseTemplate)}
        >
          {SHOWCASE_TEMPLATES.map((item) => (
            <option key={item} value={item}>
              {templateLabel(item)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 md:col-span-3">
        <Button type="submit" size="sm" disabled={createShowcase.isPending}>
          Crear collage
        </Button>
        {message ? (
          <span className="text-xs text-muted-foreground">{message}</span>
        ) : null}
      </div>
    </form>
  )
}

export function GalleryPanel() {
  const { data, isLoading, isError, error } = useAdminShowcases()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para administrar la galería.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <NewShowcaseForm />

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : isError ? (
        <p className="text-sm text-destructive text-pretty">
          {error instanceof Error ? error.message : 'No se pudo cargar la galería.'}
        </p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          Crea tu primer collage arriba.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {data.map((showcase) => (
            <ShowcaseEditor key={showcase.id} showcase={showcase} />
          ))}
        </div>
      )}
    </div>
  )
}
