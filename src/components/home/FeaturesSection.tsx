import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/common/SectionHeading'
import { FeatureCard } from '@/components/cards/FeatureCard'
import { floatY, floatYSlow, slideByIndex, slideFromLeft, slideFromRight, staggerContainer, viewportOnce } from '@/lib/motion'
import type { FeatureItem } from '@/types'

const features: FeatureItem[] = [
  { id: 'global', icon: 'Globe2', title: 'Global Competition', description: 'Regional qualifiers on five continents feed directly into the World Championship bracket.' },
  { id: 'live', icon: 'Radio', title: 'Live-Streamed Matches', description: 'Every quarterfinal, semifinal, and final match is broadcast live with expert commentary.' },
  { id: 'fair', icon: 'ShieldCheck', title: 'Certified Fair Play', description: 'An independent referee panel and digital move-review system protect every result.' },
  { id: 'prize', icon: 'Trophy', title: 'Real Prize Pool', description: 'A growing prize pool is distributed across finalists in every division, every season.' },
  { id: 'divisions', icon: 'Layers', title: 'Divisions For Everyone', description: 'Open, Masters, and Junior divisions mean there is a bracket for every skill level.' },
  { id: 'community', icon: 'Users', title: 'A Global Community', description: 'Connect with players, coaches, and fans from more than 120 countries.' },
]

const showcase = [
  { src: '/home/home-feature-live.png', label: 'Live Finals', float: floatY },
  { src: '/home/home-feature-open.png', label: 'Open Division', float: floatYSlow },
  { src: '/home/home-feature-masters.png', label: 'Masters', float: floatY },
  { src: '/home/home-feature-junior.png', label: 'Junior', float: floatYSlow },
]

export function FeaturesSection() {
  return (
    <section className="section-y bg-surface-white">
      <div className="container-page">
        <SectionHeading eyebrow="WHY COMPETE" title="Core Attributes Of The Championship" />

        {/* Dual-side image showcase — settles toward center */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {showcase.map((item, i) => (
            <motion.div
              key={item.src}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={i % 2 === 0 ? slideFromLeft : slideFromRight}
            >
              <motion.div animate={item.float} className="relative overflow-hidden rounded-2xl border border-black/5 shadow-card">
                <img
                  src={item.src}
                  alt={item.label}
                  className="aspect-square h-full w-full object-cover sm:aspect-[3/4] lg:aspect-square"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-3">
                  <p className="text-[11px] font-bold tracking-wide text-white uppercase">{item.label}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={feature.id} variants={slideByIndex(i)}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
