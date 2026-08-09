import { motion } from 'framer-motion'
import type { Sponsor } from '@/types'

interface SponsorLogoProps {
  sponsor: Sponsor
  /** Position within the grid — even indexes slide in from the left, odd from the right, converging toward the center. */
  index?: number
}

/** Smooth, non-abrupt deceleration curve (~ease-out) for the slide-in. */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function SponsorLogo({ sponsor, index = 0 }: SponsorLogoProps) {
  const offsetX = index % 2 === 0 ? -64 : 64

  const content = sponsor.logo_url ? (
    <img src={sponsor.logo_url} alt={sponsor.name} className="absolute inset-0 h-full w-full object-cover" />
  ) : (
    <span className="relative z-10 max-w-[90%] truncate text-center text-lg font-display font-bold text-ink/70">
      {sponsor.name}
    </span>
  )

  const className =
    'relative flex h-28 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-card'

  const motionProps = {
    initial: { opacity: 0, x: offsetX },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.35 },
    transition: { duration: 0.65, ease: EASE_OUT, delay: (index % 4) * 0.06 },
  } as const

  const href = sponsor.website_url && sponsor.website_url !== '#' ? sponsor.website_url : null

  if (!href) {
    return (
      <motion.div {...motionProps} className={className}>
        {content}
      </motion.div>
    )
  }

  return (
    <motion.a
      {...motionProps}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      className={className}
      aria-label={`Visit ${sponsor.name}'s website`}
    >
      {content}
    </motion.a>
  )
}
