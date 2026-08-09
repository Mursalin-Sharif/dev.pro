import { useSponsors } from '@/hooks/useSponsors'
import { mockSponsors } from '@/lib/mockData'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'

/** Minimum logos in one half of the track so short lists still scroll smoothly. */
const MIN_TRACK_LOGOS = 8

function MarqueeLogo({
  sponsor,
  variant,
  compact,
}: {
  sponsor: Sponsor
  variant: 'light' | 'dark'
  compact?: boolean
}) {
  const href = sponsor.website_url && sponsor.website_url !== '#' ? sponsor.website_url : null
  const content = sponsor.logo_url ? (
    <img
      src={sponsor.logo_url}
      alt={sponsor.name}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : (
    <span
      className={cn(
        'relative z-10 max-w-[90%] truncate px-1 text-center font-display font-bold',
        compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
        variant === 'dark' ? 'text-ink/80' : 'text-ink/70',
      )}
    >
      {sponsor.name}
    </span>
  )

  const className = cn(
    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl',
    compact ? 'h-10 w-[110px] sm:h-16 sm:w-[160px]' : 'h-14 w-[140px] sm:h-20 sm:w-[180px]',
    variant === 'dark'
      ? 'border border-white/15 bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]'
      : 'border border-black/5 bg-white shadow-card',
  )

  if (!href) {
    return <div className={className}>{content}</div>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, 'transition-transform hover:-translate-y-0.5')}
      aria-label={`Visit ${sponsor.name}'s website`}
    >
      {content}
    </a>
  )
}

function buildTrack(sponsors: Sponsor[]): Sponsor[] {
  if (sponsors.length === 0) return []
  const copies = Math.max(1, Math.ceil(MIN_TRACK_LOGOS / sponsors.length))
  return Array.from({ length: copies }, () => sponsors).flat()
}

interface SponsorsMarqueeProps {
  variant?: 'light' | 'dark'
  /** Smaller logo chips — used in mobile hero first-screen layout. */
  compact?: boolean
  className?: string
}

/** Auto-scrolling sponsor logos from admin (`useSponsors`). Falls back to mock when DB is empty. */
export function SponsorsMarquee({ variant = 'light', compact = false, className }: SponsorsMarqueeProps) {
  const { data: sponsors } = useSponsors()
  const list = sponsors && sponsors.length > 0 ? sponsors : mockSponsors
  const track = buildTrack(list)
  const loop = [...track, ...track]
  const durationSec = Math.max(24, track.length * 3.5)

  const fadeFrom = variant === 'dark' ? 'from-navy' : 'from-surface-white'

  return (
    <div className={cn('relative overflow-hidden', className)} aria-label="Sponsors">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 bg-gradient-to-r to-transparent',
          compact ? 'w-8 sm:w-14' : 'w-10 sm:w-16',
          fadeFrom,
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 bg-gradient-to-l to-transparent',
          compact ? 'w-8 sm:w-14' : 'w-10 sm:w-16',
          fadeFrom,
        )}
      />
      <div
        className={cn(
          'flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:w-full motion-reduce:justify-center',
          compact ? 'gap-2 px-2 sm:gap-4 sm:px-4' : 'gap-3 px-4 sm:gap-4',
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loop.map((sponsor, index) => (
          <MarqueeLogo
            key={`${sponsor.id}-${index}`}
            sponsor={sponsor}
            variant={variant}
            compact={compact}
          />
        ))}
      </div>
    </div>
  )
}
