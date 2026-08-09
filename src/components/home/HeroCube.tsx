import { motion } from 'framer-motion'
import { RotatingCube } from '@/components/common/RotatingCube'

/** Decorative 3D rotating cube for the hero — an original "checkers die" motif, no crypto branding. */
export function HeroCube() {
  return (
    <motion.div
      className="mx-auto hidden h-[280px] w-[280px] items-center justify-center sm:flex lg:mx-0"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <RotatingCube size={180} variant="checkers" duration={18} />
    </motion.div>
  )
}
