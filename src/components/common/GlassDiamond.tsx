import { motion } from 'framer-motion'

interface GlassDiamondProps {
  size?: number
  className?: string
}

/**
 * Hollow glassmorphic diamond — square frame rotated 45°, iridescent
 * cyan / magenta / yellow neon edges. Matches the BlockDAG center nav gem.
 */
export function GlassDiamond({ size = 44, className }: GlassDiamondProps) {
  return (
    <motion.div
      className={`relative ${className ?? ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      animate={{
        filter: [
          'drop-shadow(0 0 6px rgba(56,189,248,0.7)) drop-shadow(0 0 14px rgba(232,121,249,0.3))',
          'drop-shadow(0 0 12px rgba(56,189,248,0.95)) drop-shadow(0 0 22px rgba(232,121,249,0.5))',
          'drop-shadow(0 0 6px rgba(56,189,248,0.7)) drop-shadow(0 0 14px rgba(232,121,249,0.3))',
        ],
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Soft bloom behind the diamond */}
      <span
        className="pointer-events-none absolute inset-[-25%] bg-cyan-400/25 blur-xl"
        style={{ transform: 'rotate(45deg)' }}
      />

      {/*
        Hollow frame: gradient border via background-clip trick.
        Fill is nearly transparent so the center reads as open glass.
      */}
      <span
        className="relative block h-full w-full rotate-45 rounded-[6px] border-[3.5px] border-transparent"
        style={{
          background: `
            linear-gradient(135deg, rgba(3,13,67,0.15), rgba(3,13,67,0.05)) padding-box,
            linear-gradient(135deg, #f0f9ff 0%, #38bdf8 22%, #e879f9 48%, #fde68a 72%, #7dd3fc 100%) border-box
          `,
          boxShadow: `
            0 0 16px rgba(56,189,248,0.6),
            0 0 32px rgba(232,121,249,0.3),
            inset 0 0 10px rgba(255,255,255,0.2)
          `,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        {/* Inner rim — adds the “thick glass edge” look */}
        <span
          className="absolute inset-[4px] rounded-[3px] border border-white/40"
          style={{
            boxShadow: 'inset 0 0 6px rgba(125,211,252,0.4), 0 0 4px rgba(232,121,249,0.25)',
          }}
        />
        {/* Specular flash on the top-left edge */}
        <span className="pointer-events-none absolute left-[14%] top-[1px] h-[2px] w-[40%] rounded-full bg-white/90 blur-[0.5px]" />
        <span className="pointer-events-none absolute left-[1px] top-[14%] h-[36%] w-[2px] rounded-full bg-cyan-200/70 blur-[0.5px]" />
      </span>
    </motion.div>
  )
}
