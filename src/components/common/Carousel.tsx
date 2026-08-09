import { useCallback, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: ReactNode[]
  className?: string
  slideClassName?: string
  showControls?: boolean
  tone?: 'light' | 'dark'
}

export function Carousel({ children, className, slideClassName, showControls = true, tone = 'light' }: CarouselProps) {
  // Plain div for the track — Embla owns transform; Framer Motion must not wrap it.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  })
  const [progress, setProgress] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setProgress(Math.min(Math.max(emblaApi.scrollProgress(), 0), 1))
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('scroll', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('scroll', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className={className}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y gap-5 sm:gap-6">
          {children.map((child, i) => (
            <div key={i} className={cn('min-w-0 shrink-0 grow-0', slideClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-6 flex items-center gap-4">
          <div className={cn('h-1 flex-1 overflow-hidden rounded-full', tone === 'dark' ? 'bg-white/15' : 'bg-black/10')}>
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(progress, 0.08) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:opacity-30',
                tone === 'dark' ? 'border-white/20 text-white' : 'border-black/10 text-ink',
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:opacity-30',
                tone === 'dark' ? 'border-white/20 text-white' : 'border-black/10 text-ink',
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
