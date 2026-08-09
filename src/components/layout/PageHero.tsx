import { motion } from 'framer-motion'

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-navy py-12 text-white sm:py-16 md:py-20">
      <div className="container-page text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-eyebrow mb-3 sm:mb-4">
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-h1 break-words px-1 text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-body-lg mx-auto mt-3 max-w-2xl px-1 text-white/70 sm:mt-4"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
