import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/common/SectionHeading'
import { StatCard } from '@/components/cards/StatCard'
import { slideByIndex, staggerContainer, viewportOnce } from '@/lib/motion'
import type { StatItem } from '@/types'

const stats: StatItem[] = [
  { id: 'countries', value: 128, suffix: '+', label: 'Countries Represented', sublabel: 'Growing every season' },
  { id: 'players', value: 42800, suffix: '+', label: 'Registered Players', sublabel: 'Across all divisions' },
  { id: 'prize', value: 250000, suffix: '', label: 'Prize Pool (USD)', sublabel: 'Distributed across finalists' },
  { id: 'matches', value: 9600, suffix: '+', label: 'Matches Played', sublabel: 'Live-streamed and archived' },
]

export function StatsSection() {
  return (
    <section className="relative section-y overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_45%)]" />
      <div className="container-page relative">
        <SectionHeading
          eyebrow="BY THE NUMBERS"
          title="A Championship Built On Real Competition"
          tone="dark"
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.id} variants={slideByIndex(i)}>
              <StatCard stat={stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
