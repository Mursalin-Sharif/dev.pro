import { useMemo } from 'react'
import { motion } from 'framer-motion'

type Tone = 'cyan' | 'violet'

interface NetworkNode {
  x: number
  y: number
  r: number
  tone: Tone
  floatX: number
  floatY: number
  duration: number
  delay: number
}

/**
 * Curated constellation layout (viewBox units, 0–1000 x, 0–600 y) — not random, for a deliberate,
 * premium look. Using a large, near-pixel-scale viewBox (rather than 0–100) keeps node radii
 * predictable in rendered px regardless of how wide the hero section stretches (with
 * `preserveAspectRatio="slice"`, a small viewBox would otherwise get scaled up disproportionately
 * on ultra-wide hero sections, turning small "nodes" into oversized blobs).
 */
const NODE_SEEDS: Array<[number, number, number, Tone]> = [
  [80, 100, 9, 'cyan'],
  [220, 240, 7, 'violet'],
  [150, 420, 8, 'cyan'],
  [350, 140, 6, 'violet'],
  [420, 360, 10, 'cyan'],
  [550, 80, 7, 'violet'],
  [600, 270, 8, 'cyan'],
  [720, 170, 7, 'violet'],
  [780, 390, 9, 'cyan'],
  [900, 130, 7, 'violet'],
  [930, 330, 8, 'cyan'],
  [500, 500, 7, 'violet'],
  [680, 520, 8, 'cyan'],
  [300, 540, 6, 'violet'],
  [100, 300, 5, 'cyan'],
  [830, 550, 7, 'violet'],
]

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
  [5, 7],
  [6, 8],
  [7, 9],
  [8, 10],
  [7, 8],
  [4, 11],
  [11, 12],
  [6, 12],
  [11, 13],
  [2, 13],
  [0, 14],
  [2, 14],
  [12, 15],
  [8, 15],
]

/** Quadratic-bezier path between two points, arced perpendicular to the line for an organic "network" curve. */
function curvedPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const bow = len * 0.14
  const cx = mx + (-dy / len) * bow
  const cy = my + (dx / len) * bow
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`
}

/**
 * A lightweight, original animated "global network" visual for the hero background —
 * glowing nodes on curved, neon-gradient connections, evoking players/matches linked
 * worldwide. Pure SVG + Framer Motion (no 3D library), tuned to stay cheap on mobile.
 */
export function NetworkBackground({ className }: { className?: string }) {
  const nodes = useMemo<NetworkNode[]>(
    () =>
      NODE_SEEDS.map(([x, y, r, tone], i) => ({
        x,
        y,
        r,
        tone,
        floatX: ((i % 3) - 1) * 16,
        floatY: ((i % 4) - 1.5) * 14,
        duration: 6 + (i % 5),
        delay: (i % 6) * 0.35,
      })),
    [],
  )

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: (i * 370) % 1000,
        y: (i * 530) % 600,
        r: 1.6 + (i % 3) * 0.8,
        tone: (i % 2 === 0 ? 'cyan' : 'violet') as Tone,
        duration: 10 + (i % 6),
        delay: (i % 5) * 0.6,
      })),
    [],
  )

  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <filter id="node-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft outer bloom behind each node — a radial fade reads as "neon glow" more cleanly than a uniform blur. */}
        <radialGradient id="halo-cyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="halo-violet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>

        {/* Glossy neon core with an offset highlight, so nodes read as lit orbs rather than flat dots. */}
        <radialGradient id="core-cyan" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#e0f6ff" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </radialGradient>
        <radialGradient id="core-violet" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="45%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </radialGradient>

        {/* Cyan-to-violet neon gradients for connection lines, alternated per edge for variety. */}
        <linearGradient id="edge-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="edge-grad-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      <g strokeLinecap="round" fill="none">
        {EDGES.map(([a, b], i) => {
          const from = nodes[a]
          const to = nodes[b]
          return (
            <motion.path
              key={`${a}-${b}`}
              d={curvedPath(from.x, from.y, to.x, to.y)}
              stroke={`url(#edge-grad-${i % 2 === 0 ? 'a' : 'b'})`}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.18, 0.5, 0.18] }}
              transition={{
                pathLength: { duration: 1.6, delay: i * 0.06, ease: 'easeOut' },
                opacity: { duration: 5 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 },
              }}
            />
          )
        })}
      </g>

      {particles.map((p, i) => (
        <motion.circle
          key={`particle-${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={p.tone === 'cyan' ? '#bae6fd' : '#ddd6fe'}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.55, 0.1], cy: [p.y, p.y - 20, p.y] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {nodes.map((node, i) => (
        <motion.g
          key={i}
          animate={{ x: [0, node.floatX, 0], y: [0, node.floatY, 0] }}
          transition={{ duration: node.duration, repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
        >
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.r * 3.2}
            fill={`url(#halo-${node.tone})`}
            initial={{ opacity: 0.5, scale: 0.85 }}
            animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.85, 1.2, 0.85] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          />
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={`url(#core-${node.tone})`}
            filter="url(#node-glow)"
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: [0.65, 1, 0.65], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          />
        </motion.g>
      ))}
    </svg>
  )
}
