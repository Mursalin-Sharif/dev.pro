import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import type { StatItem } from '@/types'

export function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft/60 p-6 text-white backdrop-blur-sm sm:p-8">
      <p className="text-display text-primary">
        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
      </p>
      <p className="text-h3 mt-2 text-white">{stat.label}</p>
      {stat.sublabel && <p className="mt-1 text-sm text-white/60">{stat.sublabel}</p>}
    </div>
  )
}
