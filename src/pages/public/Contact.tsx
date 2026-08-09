import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, MapPin, Loader2 } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Contact() {
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    toast.success('Thanks — our team will get back to you shortly.')
    e.currentTarget.reset()
    setSubmitting(false)
  }

  return (
    <>
      <Helmet>
        <title>Contact — {SITE_NAME}</title>
        <meta name="description" content="Get in touch with the Hopeland Global Checkers organizing committee." />
        <link rel="canonical" href={`${SITE_URL}/contact`} />
      </Helmet>

      <PageHero eyebrow="GET IN TOUCH" title="Contact Us" subtitle="Questions about registration, sponsorship, or media? We'd love to hear from you." />

      <section className="section-y bg-surface-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Email</p>
                <p className="text-sm text-muted">hello@hopelandglobalcheckers.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Organizing Committee</p>
                <p className="text-sm text-muted">Hopeland Global Checkers, International Office</p>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-4 shadow-card sm:p-6 md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full Name" name="name" placeholder="Jane Doe" required />
              <FormField label="Email Address" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <FormField label="Subject" name="subject" placeholder="Sponsorship inquiry" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-bold text-ink">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" size="lg" disabled={submitting} icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}>
              {submitting ? 'Sending…' : 'Send Message'}
            </Button>
          </motion.form>
        </div>
      </section>
    </>
  )
}
