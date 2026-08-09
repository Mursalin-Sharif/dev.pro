import { SectionHeading } from '@/components/common/SectionHeading'
import { Carousel } from '@/components/common/Carousel'
import { TestimonialCard } from '@/components/cards/TestimonialCard'
import type { TestimonialItem } from '@/types'

const testimonials: TestimonialItem[] = [
  { id: 'te1', name: 'Amara Okafor', role: '2025 Open Division Finalist', quote: 'The qualifier system gave me a real path from my local club to the world stage. Nothing else compares.', avatarInitials: 'AO' },
  { id: 'te2', name: 'Liam Carter', role: 'Regional Champion, North America', quote: 'The live broadcast and referee panel made every match feel like it truly mattered.', avatarInitials: 'LC' },
  { id: 'te3', name: 'Sofia Reyes', role: 'Junior Division Player', quote: 'I started in the Junior division at 12 — this season I qualified for the Open bracket.', avatarInitials: 'SR' },
  { id: 'te4', name: 'Kenji Watanabe', role: 'Coach & Federation Delegate', quote: 'The transparency around seeding and results is exactly what competitive checkers needed.', avatarInitials: 'KW' },
]

export function TestimonialsSection() {
  return (
    <section className="section-y bg-surface-white">
      <div className="container-page">
        <SectionHeading eyebrow="COMMUNITY" title="Join The Fastest Growing Community" subtitle="Hear from players and coaches across the Hopeland Global Checkers community." />
        <div className="mt-12">
          <Carousel slideClassName="w-[min(100%,20rem)] sm:w-96">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}
