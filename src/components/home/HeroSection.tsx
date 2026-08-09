import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { HeroCube } from '@/components/home/HeroCube'
import { NetworkBackground } from '@/components/home/NetworkBackground'
import { SponsorsMarquee } from '@/components/home/SponsorsMarquee'
import { fadeUp, floatY, floatYSlow, slideFromLeft, slideFromRight, staggerContainer } from '@/lib/motion'

/** Top chrome ≈ announcement + sticky header; mobile also clears bottom nav. */
const HERO_MIN_H =
  'min-h-[calc(100svh-6.5rem)] max-lg:min-h-[calc(100svh-6.5rem-4.25rem-env(safe-area-inset-bottom,0px))]'

export function HeroSection() {
  const { t } = useTranslation('home')

  return (
    <section
      className={`relative flex ${HERO_MIN_H} flex-col justify-center overflow-x-clip overflow-y-hidden bg-navy text-white max-lg:pb-4`}
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/home/home-hero-board.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          draggable={false}
        />
        <NetworkBackground className="h-full w-full opacity-55 mix-blend-screen sm:opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/45" />

        {/* Mid glow — fills vertical space with atmosphere */}
        <div className="absolute inset-x-0 top-1/3 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.18),transparent_65%)]" />

        {/* Bottom lucrative gradient → blends into next section */}
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,transparent_0%,rgba(14,165,233,0.14)_28%,rgba(3,13,67,0.55)_55%,rgba(7,16,64,0.92)_78%,#f5f6fa_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.35),transparent_70%)]" />
      </div>

      <motion.img
        src="/home/home-feature-live.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-24 right-[8%] hidden h-28 w-20 rounded-xl object-cover opacity-80 shadow-[0_0_40px_rgba(14,165,233,0.35)] lg:block"
        animate={floatY}
        draggable={false}
      />
      <motion.img
        src="/home/home-feature-open.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-28 left-[6%] hidden h-24 w-[4.5rem] rounded-xl object-cover opacity-70 shadow-[0_0_30px_rgba(47,107,255,0.3)] xl:block"
        animate={floatYSlow}
        draggable={false}
      />

      <div className="container-page relative grid w-full gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-6 lg:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.span
            variants={slideFromLeft}
            className="text-eyebrow mb-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs"
          >
            {t('hero.eyebrow')}
          </motion.span>
          <motion.h1
            variants={slideFromLeft}
            className="max-w-4xl font-display font-extrabold tracking-tight text-white text-[clamp(1.65rem,6.2vw,2.5rem)] leading-[1.08] sm:text-display"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-2 max-w-xl text-[0.9rem] leading-snug text-white/70 line-clamp-3 sm:mt-4 sm:max-w-2xl sm:text-body-lg sm:leading-relaxed sm:line-clamp-none lg:mx-0"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div
            variants={slideFromLeft}
            className="mt-4 flex w-full max-w-md flex-col items-stretch gap-2 sm:mt-7 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
          >
            <Link to="/register" className="min-w-0 sm:flex-none">
              <Button
                size="md"
                icon={<ArrowRight size={16} />}
                className="w-full px-4 py-2.5 text-sm sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                {t('hero.ctaPrimary')}
              </Button>
            </Link>
            <Link to="/videos" className="min-w-0 sm:flex-none">
              <Button
                size="md"
                variant="outline"
                icon={<PlayCircle size={16} />}
                className="w-full border-white/30 px-4 py-2.5 text-sm text-white sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideFromRight}
          className="relative hidden items-center justify-center lg:flex"
        >
          <motion.div animate={floatY} className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
            <HeroCube />
          </motion.div>
        </motion.div>

        <div className="relative z-10 overflow-hidden border-t border-white/10 pt-3 sm:pt-4 lg:col-span-2 lg:pt-5">
          <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase sm:mb-3 sm:text-[11px] sm:tracking-[0.2em]">
            Official partners
          </p>
          <SponsorsMarquee variant="dark" compact />
        </div>
      </div>
    </section>
  )
}
