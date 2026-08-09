import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/layout/PageHero'
import { SectionHeading } from '@/components/common/SectionHeading'
import { SponsorLogo } from '@/components/cards/SponsorLogo'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { useSponsors } from '@/hooks/useSponsors'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import type { Sponsor } from '@/types'

const tiers: Array<{ key: Sponsor['tier']; label: string }> = [
  { key: 'platinum', label: 'Platinum Partners' },
  { key: 'gold', label: 'Gold Partners' },
  { key: 'silver', label: 'Silver Partners' },
  { key: 'partner', label: 'Community Partners' },
]

export default function Sponsors() {
  const { data: sponsors, isLoading } = useSponsors()

  return (
    <>
      <Helmet>
        <title>Sponsors — {SITE_NAME}</title>
        <meta name="description" content="Meet the organizations powering the Hopeland Global Checkers World Championship." />
        <link rel="canonical" href={`${SITE_URL}/sponsors`} />
      </Helmet>

      <PageHero eyebrow="OUR PARTNERS" title="Sponsors & Partners" subtitle="The organizations powering every board, broadcast, and prize pool of the championship." />

      <section className="section-y bg-surface-white">
        <div className="container-page">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {tiers.map((tier) => {
                const items = (sponsors ?? []).filter((s) => s.tier === tier.key)
                if (items.length === 0) return null
                return (
                  <div key={tier.key}>
                    <SectionHeading title={tier.label} align="left" className="mx-0 text-left" />
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {items.map((sponsor, index) => (
                        <SponsorLogo key={sponsor.id} sponsor={sponsor} index={index} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-y bg-navy text-center text-white">
        <div className="container-page">
          <h2 className="text-h2 text-white">Become a Championship Sponsor</h2>
          <p className="text-body-lg mx-auto mt-4 max-w-xl text-white/70">
            Reach a global audience of players, coaches, and fans across more than 120 countries.
          </p>
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
