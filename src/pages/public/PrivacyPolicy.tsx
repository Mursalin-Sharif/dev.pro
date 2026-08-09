import { Helmet } from 'react-helmet-async'
import { PageHero } from '@/components/layout/PageHero'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/privacy-policy`} />
      </Helmet>

      <PageHero eyebrow="LEGAL" title="Privacy Policy" />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-3xl text-ink/80">
          <div className="flex flex-col gap-6 text-sm leading-relaxed">
            <p>
              This placeholder Privacy Policy describes, in general terms, how Hopeland Global Checkers collects,
              uses, and protects information submitted through registration, contact, and admin forms on this site.
              Replace this content with policy text reviewed by your legal counsel before launch.
            </p>
            <h2 className="text-h3 text-ink">Information We Collect</h2>
            <p>
              Registration data (name, date of birth, city, country, phone, email), payment metadata processed via
              Stripe, and standard analytics data such as browser type and approximate location used for language
              defaults.
            </p>
            <h2 className="text-h3 text-ink">How We Use Information</h2>
            <p>
              To process championship registrations, communicate event updates, verify player eligibility by
              division, and improve the site experience.
            </p>
            <h2 className="text-h3 text-ink">Data Storage &amp; Security</h2>
            <p>
              Data is stored using Supabase with row-level security restricting registration records to authorized
              administrators only. Payment card details are never stored on our servers — all payments are handled
              directly by Stripe.
            </p>
            <h2 className="text-h3 text-ink">Contact</h2>
            <p>For questions about this policy, contact hello@hopelandglobalcheckers.com.</p>
          </div>
        </div>
      </section>
    </>
  )
}
