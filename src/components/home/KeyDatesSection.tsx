import { SectionHeading } from '@/components/common/SectionHeading'
import { Carousel } from '@/components/common/Carousel'
import { TimelineCard } from '@/components/cards/TimelineCard'
import type { TimelineItem } from '@/types'

const timeline: TimelineItem[] = [
  { id: 't1', quarter: 'Q1', title: 'Registration Opens', items: ['Early-bird entry fee', 'Player profile setup'], status: 'done' },
  { id: 't2', quarter: 'Q1', title: 'Regional Qualifiers Begin', items: ['9 host cities', '5 continents'], status: 'active' },
  { id: 't3', quarter: 'Q2', title: 'Qualifiers Conclude', items: ['Regional champions crowned', 'Bracket seeding published'], status: 'upcoming' },
  { id: 't4', quarter: 'Q3', title: 'World Semifinals', items: ['Live-streamed matches', 'Certified referee panel'], status: 'upcoming' },
  { id: 't5', quarter: 'Q3', title: 'World Final & Awards', items: ['Global broadcast', 'Prize pool distribution'], status: 'upcoming' },
  { id: 't6', quarter: 'Q4', title: 'Season Recap & Next Season Announced', items: ['Highlights release', 'Next season registration opens'], status: 'upcoming' },
]

export function KeyDatesSection() {
  return (
    <section className="section-y bg-navy">
      <div className="container-page">
        <SectionHeading eyebrow="SEASON ROADMAP" title="Key Dates" tone="dark" />
        <div className="mt-12">
          <Carousel slideClassName="w-[min(100%,18rem)] sm:w-80" tone="dark">
            {timeline.map((item, i) => (
              <TimelineCard key={item.id} item={item} index={i} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}
