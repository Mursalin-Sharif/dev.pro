import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { slideFromLeft, slideFromRight, staggerContainer, viewportOnce } from '@/lib/motion'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', tone = 'light', className }: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
      className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {eyebrow && (
        <motion.p variants={slideFromLeft} className="text-eyebrow mb-3">
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        variants={slideFromRight}
        className={cn('text-h2', tone === 'dark' ? 'text-white' : 'text-ink')}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={slideFromLeft}
          className={cn('text-body-lg mt-4', tone === 'dark' ? 'text-white/70' : 'text-muted')}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
