import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

/**
 * Animates a number from 0 to `target` once the given element scrolls into
 * view, writing the formatted value directly into the element's textContent
 * (avoids a re-render per frame).
 */
export function useCountUp(target: number, options?: { duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const duration = options?.duration ?? 1.6
  const suffix = options?.suffix ?? ''

  useEffect(() => {
    if (!isInView || !ref.current) return
    const node = ref.current
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        node.textContent = `${Math.round(value).toLocaleString()}${suffix}`
      },
    })
    return () => controls.stop()
  }, [isInView, target, duration, suffix])

  return ref
}
