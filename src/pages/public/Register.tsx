import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ShieldCheck, Globe2, Clock } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { RegistrationForm } from '@/components/forms/RegistrationForm'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

const perks = [
  { icon: Globe2, text: 'Access to your regional qualifier bracket' },
  { icon: Clock, text: 'Live-stream credentials for every stage' },
  { icon: ShieldCheck, text: 'Certified referee panel on every match' },
]

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Register — {SITE_NAME}</title>
        <meta name="description" content="Register to compete in the Hopeland Global Checkers World Championship." />
        <link rel="canonical" href={`${SITE_URL}/register`} />
      </Helmet>

      <PageHero
        eyebrow="JOIN THE CHAMPIONSHIP"
        title="Register Now"
        subtitle="Pay the registration fee to confirm your spot. If payment fails, nothing is saved — you can register again."
      />

      <section className="section-y bg-surface-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="order-2 lg:order-1">
            <h2 className="text-h3 text-ink">What&rsquo;s included</h2>
            <div className="mt-6 flex flex-col gap-5">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <perk.icon size={18} />
                  </span>
                  <p className="pt-2 text-sm text-muted">{perk.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 rounded-2xl border border-black/5 bg-white p-4 shadow-card sm:p-6 md:p-10 lg:order-2"
          >
            <RegistrationForm />
          </motion.div>
        </div>
      </section>
    </>
  )
}
