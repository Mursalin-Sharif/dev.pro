import { motion } from 'framer-motion'
import { useId } from 'react'

type CubeTone = 'primary' | 'red' | 'dark' | 'light'

interface RotatingCubeProps {
  size?: number
  variant?: 'checkers' | 'wireframe'
  duration?: number
  className?: string
}

function CheckersFace({ size, transform, tone }: { size: number; transform: string; tone: CubeTone }) {
  const squares = Array.from({ length: 9 })
  const toneClasses: Record<CubeTone, string> = {
    primary: 'from-primary to-primary-dark',
    red: 'from-checkers-red to-[#8f1f1f]',
    dark: 'from-checkers-black to-navy',
    light: 'from-white to-surface-light',
  }

  return (
    <div
      className={`absolute grid grid-cols-3 grid-rows-3 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br shadow-[0_0_40px_-8px_rgba(14,165,233,0.45)] ${toneClasses[tone]}`}
      style={{ width: size, height: size, transform, backfaceVisibility: 'hidden' }}
    >
      {squares.map((_, i) => {
        const isDark = (Math.floor(i / 3) + (i % 3)) % 2 === 0
        return <div key={i} className={isDark ? 'bg-black/20' : 'bg-white/10'} aria-hidden="true" />
      })}
    </div>
  )
}

/**
 * Glass wireframe face — hollow center + prismatic chromatic edges
 * (cyan / magenta / lime) inspired by BlockDAG-style 3D gem, original SVG.
 */
function WireframeFace({
  size,
  transform,
  uid,
}: {
  size: number
  transform: string
  uid: string
}) {
  const r = size * 0.16
  const pad = 2
  const glow = `glow-${uid}`
  const gCyan = `cyan-${uid}`
  const gMag = `mag-${uid}`
  const gLime = `lime-${uid}`

  return (
    <div
      className="absolute"
      style={{
        width: size,
        height: size,
        transform,
        backfaceVisibility: 'visible',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id={gCyan} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={gMag} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="50%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id={gLime} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft outer bloom */}
        <rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={r}
          ry={r}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3.5"
          opacity="0.22"
          filter={`url(#${glow})`}
        />

        {/* Magenta chromatic fringe */}
        <rect
          x={pad + 1.2}
          y={pad - 0.4}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={r}
          ry={r}
          fill="none"
          stroke={`url(#${gMag})`}
          strokeWidth="2.1"
          opacity="0.85"
        />

        {/* Lime/yellow fringe */}
        <rect
          x={pad - 0.9}
          y={pad + 1}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={r}
          ry={r}
          fill="none"
          stroke={`url(#${gLime})`}
          strokeWidth="1.8"
          opacity="0.75"
        />

        {/* Main cyan glass rim */}
        <rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={r}
          ry={r}
          fill="rgba(56,189,248,0.06)"
          stroke={`url(#${gCyan})`}
          strokeWidth="2.2"
          filter={`url(#${glow})`}
        />

        {/* Inner water highlight */}
        <rect
          x={size * 0.22}
          y={size * 0.22}
          width={size * 0.56}
          height={size * 0.56}
          rx={r * 0.7}
          ry={r * 0.7}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="0.9"
        />
      </svg>
    </div>
  )
}

export function RotatingCube({ size = 180, variant = 'checkers', duration = 18, className }: RotatingCubeProps) {
  const uid = useId().replace(/:/g, '')
  const isWire = variant === 'wireframe'

  /**
   * Wireframe cubes need a smaller edge than the box — isometric projection
   * + glow would otherwise overflow and look cut off / “wrong” vs BlockDAG’s 50×50 gif.
   */
  const edge = isWire ? size * 0.58 : size
  const half = edge / 2

  const faces: { transform: string; tone: CubeTone }[] = [
    { transform: `translateZ(${half}px)`, tone: 'primary' },
    { transform: `rotateY(180deg) translateZ(${half}px)`, tone: 'dark' },
    { transform: `rotateY(90deg) translateZ(${half}px)`, tone: 'red' },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, tone: 'light' },
    { transform: `rotateX(90deg) translateZ(${half}px)`, tone: 'light' },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, tone: 'dark' },
  ]

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        perspective: size * 4,
        filter: isWire
          ? 'drop-shadow(0 0 6px rgba(34,211,238,0.65)) drop-shadow(0 0 14px rgba(56,189,248,0.35))'
          : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: isWire ? 'rotateX(-22deg) rotateZ(28deg)' : undefined,
        }}
      >
        <motion.div
          className="relative"
          style={{
            width: edge,
            height: edge,
            margin: isWire ? (size - edge) / 2 : 0,
            transformStyle: 'preserve-3d',
          }}
          animate={
            isWire
              ? { rotateY: [0, 360] }
              : { rotateY: [0, 360], rotateX: [-10, 10, -10] }
          }
          transition={{
            rotateY: { duration, repeat: Infinity, ease: 'linear' },
            ...(isWire
              ? {}
              : { rotateX: { duration: duration * 0.4, repeat: Infinity, ease: 'easeInOut' } }),
          }}
        >
          {faces.map((face, i) =>
            isWire ? (
              <WireframeFace
                key={face.transform}
                uid={`${uid}${i}`}
                size={edge}
                transform={face.transform}
              />
            ) : (
              <CheckersFace key={face.transform} size={edge} transform={face.transform} tone={face.tone} />
            ),
          )}
        </motion.div>
      </div>
    </div>
  )
}
