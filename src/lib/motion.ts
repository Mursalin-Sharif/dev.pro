import type { Variants } from 'framer-motion'

/** Shared ease — settle into place (BlockDAG-like scroll reveals). */
export const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Replays every time the block enters/leaves the viewport (scroll up or down). */
export const viewportReplay = {
  once: false,
  margin: '-10% 0px' as const,
  amount: 0.3,
}

/** @deprecated use viewportReplay — kept as alias so imports keep working */
export const viewportOnce = viewportReplay

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_SETTLE },
  },
}

/** Slide in from the left and settle center. */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -72 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: EASE_SETTLE },
  },
}

/** Slide in from the right and settle center. */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 72 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: EASE_SETTLE },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
}

/** Alternate left/right by index for grids/lists. */
export function slideByIndex(index: number): Variants {
  return index % 2 === 0 ? slideFromLeft : slideFromRight
}

/** Gentle float loop for hero / decorative images. */
export const floatY = {
  y: [0, -12, 0, 10, 0],
  transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const },
}

export const floatYSlow = {
  y: [0, 14, 0, -10, 0],
  rotate: [0, 2, 0, -2, 0],
  transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' as const },
}
