import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { slideFromLeft, slideFromRight, staggerContainer, viewportOnce } from '@/lib/motion'

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <img
        src="/home/home-cta-glow.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-primary/40" />
      <div className="container-page section-y relative text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.h2 variants={slideFromLeft} className="text-h1 mx-auto max-w-3xl text-white">
            Secure Your Spot In The Championship
          </motion.h2>
          <motion.p variants={slideFromRight} className="text-body-lg mx-auto mt-4 max-w-xl text-white/85">
            Registration includes your qualifier entry, player profile, and live-stream credentials.
          </motion.p>
          <motion.div
            variants={slideFromLeft}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight size={18} />}>
                Register Now
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white/40 text-white">
                How It Works
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
