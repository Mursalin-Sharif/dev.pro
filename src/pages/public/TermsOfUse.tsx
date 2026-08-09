import { Helmet } from 'react-helmet-async'
import { PageHero } from '@/components/layout/PageHero'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/terms-of-use`} />
      </Helmet>

      <PageHero eyebrow="LEGAL" title="Terms of Use" />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-3xl text-ink/80">
          <div className="flex flex-col gap-6 text-sm leading-relaxed">
            <p>
              These placeholder Terms of Use govern participation in the Hopeland Global Checkers World Championship
              and use of this website. Replace this content with terms reviewed by your legal counsel before launch.
            </p>
            <h2 className="text-h3 text-ink">Eligibility</h2>
            <p>
              Players must meet the minimum age and division requirements described on the Register page. False or
              misrepresented registration information may result in disqualification.
            </p>
            <h2 className="text-h3 text-ink">Registration Fees</h2>
            <p>
              Registration fees are processed securely through Stripe. Refund eligibility windows are described at
              the time of registration and in confirmation communications.
            </p>
            <h2 className="text-h3 text-ink">Code of Conduct</h2>
            <p>
              Players, coaches, and spectators are expected to act with good sportsmanship. Violations of the fair
              play policy may result in match forfeiture or disqualification, at the discretion of the certified
              referee panel.
            </p>
            <h2 className="text-h3 text-ink">Changes to These Terms</h2>
            <p>We may update these terms between seasons. Continued participation constitutes acceptance of the updated terms.</p>
          </div>
        </div>
      </section>
    </>
  )
}
