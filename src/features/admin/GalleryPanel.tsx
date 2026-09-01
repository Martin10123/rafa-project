import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  parseOptionalBeadSize,
  SHOWCASE_TEMPLATES,
  templateLabel,
  templateSlotCount,
  type Showcase,
  type ShowcaseTemplate,
} from '@/domain/showcase/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { logEventSafe } from '@/shared/logging'
import { ShowcaseCarousel } from '@/features/gallery/ShowcaseCarousel'
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
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_showcase_updated',
        success: true,
        message: 'Trabajo de galería actualizado',
        entityType: 'showcase',
        entityId: showcase.id,
      })
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
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_image_uploaded',
        success: true,
        message: 'Imagen subida a la galería',
        entityType: 'showcase',
        entityId: showcase.id,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo subir.'
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_image_error',
        success: false,
        message: msg,
        entityType: 'showcase',
        entityId: showcase.id,
      })
      setMessage(msg)
    }
  }

  async function onDelete() {
    if (!window.confirm('¿Eliminar este trabajo de la galería?')) return
    setMessage(undefined)
    try {
      await deleteShowcase.mutateAsync(showcase.id)
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_showcase_deleted',
        success: true,
        message: 'Trabajo de galería eliminado',
        entityType: 'showcase',
        entityId: showcase.id,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar.')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-2 border-b">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm">{showcase.title}</CardTitle>
            <CardDescription className="text-xs">
              Vista previa del carrusel público
            </CardDescription>
          </div>
          <Badge variant={published ? 'default' : 'outline'}>
            {published ? 'Publicado' : 'Borrador'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <ShowcaseCarousel
          images={showcase.images}
          title={showcase.title}
          aspectClassName="aspect-[16/10]"
        />

        {showcase.images.length > 0 ? (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {showcase.images.map((image) => (
              <li key={image.id} className="relative shrink-0">
                <img
                  src={image.imageUrl}
                  alt={image.altText ?? showcase.title}
                  className="size-16 rounded-lg object-cover ring-1 ring-border"
                />
                <Button
                  type="button"
                  size="icon-xs"
                  variant="destructive"
                  aria-label="Quitar foto"
                  className="absolute -top-1.5 -right-1.5"
                  disabled={deleteImage.isPending}
                  onClick={() => void deleteImage.mutateAsync(image)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sube hasta {slots} foto{slots === 1 ? '' : 's'} para este trabajo.
          </p>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex-col items-stretch gap-4 pt-4">
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
              Cantidad de fotos
            </Label>
            <Select
              value={template}
              onValueChange={(value) => setTemplate(value as ShowcaseTemplate)}
            >
              <SelectTrigger id={`template-${showcase.id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOWCASE_TEMPLATES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {templateLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`order-${showcase.id}`} className="text-xs">
              Orden en galería
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
            <Select
              value={published ? 'published' : 'draft'}
              onValueChange={(value) => setPublished(value === 'published')}
            >
              <SelectTrigger id={`published-${showcase.id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
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
              <ImagePlus data-icon="inline-start" />
              Subir foto ({showcase.images.length}/{slots})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={deleteShowcase.isPending}
              onClick={() => void onDelete()}
            >
              Eliminar trabajo
            </Button>
            {message ? (
              <span className="text-xs text-muted-foreground">{message}</span>
            ) : null}
          </div>
        </form>
      </CardFooter>
    </Card>
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
      const created = await createShowcase.mutateAsync({ title, template })
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_showcase_created',
        success: true,
        message: 'Trabajo de galería creado',
        entityType: 'showcase',
        entityId: created.id,
      })
      setTitle('')
      setMessage('Trabajo creado. Sube las fotos abajo.')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear.'
      logEventSafe({
        category: 'gallery',
        eventType: 'gallery_image_error',
        success: false,
        message: msg,
        detail: { action: 'create_showcase' },
      })
      setMessage(msg)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Nuevo trabajo</CardTitle>
        <CardDescription className="text-xs">
          Elige cuántas fotos tendrá el carrusel y súbelas después de crear.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-showcase-title" className="text-xs">
              Título
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
              Fotos
            </Label>
            <Select
              value={template}
              onValueChange={(value) => setTemplate(value as ShowcaseTemplate)}
            >
              <SelectTrigger id="new-showcase-template" className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOWCASE_TEMPLATES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {templateLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={createShowcase.isPending}>
              Crear
            </Button>
          </div>
          {message ? (
            <p className="text-xs text-muted-foreground md:col-span-3">{message}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
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
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      ) : isError ? (
        <p className="text-sm text-destructive text-pretty">
          {error instanceof Error ? error.message : 'No se pudo cargar la galería.'}
        </p>
      ) : !data?.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Sin trabajos</CardTitle>
            <CardDescription className="text-xs">
              Crea el primero con el formulario de arriba.
            </CardDescription>
          </CardHeader>
        </Card>
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
