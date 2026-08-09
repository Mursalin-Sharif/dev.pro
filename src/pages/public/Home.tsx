import { Helmet } from 'react-helmet-async'
import { HeroSection } from '@/components/home/HeroSection'
import { AboutTeaserSection } from '@/components/home/AboutTeaserSection'
import { StatsSection } from '@/components/home/StatsSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { VideosPreviewSection } from '@/components/home/VideosPreviewSection'
import { KeyDatesSection } from '@/components/home/KeyDatesSection'
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection'
import { FAQSection } from '@/components/home/FAQSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FinalCTASection } from '@/components/home/FinalCTASection'
import { eventJsonLd, organizationJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Home() {
  const jsonLd = [
    organizationJsonLd(),
    eventJsonLd({
      name: 'Hopeland Global Checkers World Championship',
      startDate: '2025-03-01',
      endDate: '2025-09-30',
      location: 'Multiple international host cities',
    }),
  ]

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} — International Checkers Championship</title>
        <meta
          name="description"
          content="Register to compete in the Hopeland Global Checkers World Championship. Watch highlights, read the latest updates, and follow the road to the title."
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content="The international checkers championship — compete, connect, and rise to the top board." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <HeroSection />
      <AboutTeaserSection />
      <StatsSection />
      <FeaturesSection />
      <VideosPreviewSection />
      <KeyDatesSection />
      <BlogPreviewSection />
      <FAQSection />
      <TestimonialsSection />
      <FinalCTASection />
    </>
  )
}
