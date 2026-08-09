import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { FeatureItem } from '@/types'
import type { LucideIcon } from 'lucide-react'

export function FeatureCard({ feature }: { feature: FeatureItem }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[feature.icon] ?? Icons.Sparkles

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-card sm:p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={24} />
      </span>
      <h3 className="text-h3 mt-5 text-ink">{feature.title}</h3>
      <p className="mt-2 text-sm text-muted">{feature.description}</p>
    </motion.div>
  )
}
