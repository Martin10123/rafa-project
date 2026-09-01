import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import type { ShowcaseImage } from '@/domain/showcase/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel'

type ShowcaseCarouselProps = {
  images: ShowcaseImage[]
  title: string
  variant?: 'default' | 'compact'
  className?: string
  aspectClassName?: string
}

function CarouselDots({ className }: { className?: string }) {
  const { api } = useCarousel()
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setSelected(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }

    api.on('reInit', onSelect)
    api.on('select', onSelect)
    queueMicrotask(onSelect)

    return () => {
      api.off('reInit', onSelect)
      api.off('select', onSelect)
    }
  }, [api])

  if (count <= 1) return null

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5',
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <Button
          key={index}
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Ir a foto ${index + 1}`}
          aria-current={index === selected ? 'true' : undefined}
          className={cn(
            'size-1.5 min-w-1.5 rounded-full p-0 hover:bg-white/80',
            index === selected ? 'bg-white' : 'bg-white/45',
          )}
          onClick={(event) => {
            event.stopPropagation()
            api?.scrollTo(index)
          }}
        />
      ))}
    </div>
  )
}

export function ShowcaseCarousel({
  images,
  title,
  variant = 'default',
  className,
  aspectClassName = 'aspect-[4/5]',
}: ShowcaseCarouselProps) {
  const compact = variant === 'compact'
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)

  if (!sorted.length) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-muted text-muted-foreground',
          aspectClassName,
          className,
        )}
      >
        <ImageIcon className="size-8 opacity-40" aria-hidden />
        <span className="sr-only">Sin fotos</span>
      </div>
    )
  }

  const multiple = sorted.length > 1

  return (
    <Carousel
      className={cn('group/carousel w-full', className)}
      opts={{ align: 'start', loop: multiple }}
    >
      <CarouselContent className={compact ? 'ml-0' : undefined}>
        {sorted.map((image) => (
          <CarouselItem key={image.id} className={compact ? 'pl-0' : undefined}>
            <div
              className={cn(
                'relative overflow-hidden rounded-xl bg-muted',
                aspectClassName,
              )}
            >
              <img
                src={image.imageUrl}
                alt={image.altText ?? title}
                className="size-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {multiple ? (
        <>
          <CarouselPrevious
            variant="secondary"
            size="icon-sm"
            className="left-2 border-0 bg-background/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 disabled:opacity-0"
            onClick={(event) => event.stopPropagation()}
          />
          <CarouselNext
            variant="secondary"
            size="icon-sm"
            className="right-2 border-0 bg-background/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 disabled:opacity-0"
            onClick={(event) => event.stopPropagation()}
          />
          <CarouselDots />
        </>
      ) : null}
    </Carousel>
  )
}
