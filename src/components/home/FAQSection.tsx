import { SectionHeading } from '@/components/common/SectionHeading'
import { FAQItem } from '@/components/cards/FAQItem'
import type { FaqItem } from '@/types'

const faqs: FaqItem[] = [
  { id: 'f1', question: 'Who can register for the championship?', answer: 'Any player aged 6 or older can register for the Open or Junior division. The Masters division is reserved for federation-rated players.' },
  { id: 'f2', question: 'How do regional qualifiers work?', answer: 'Nine host cities across five continents run single-elimination qualifiers. Regional champions advance directly to the World Championship semifinal bracket.' },
  { id: 'f3', question: 'Is the registration fee refundable?', answer: 'Registration fees are refundable up to 14 days before your regional qualifier date. After that, fees are non-refundable but transferable to the next season.' },
  { id: 'f4', question: 'Will matches be streamed online?', answer: 'Yes — every match from the quarterfinals onward is live-streamed with commentary, and full replays are published to the Videos hub afterward.' },
  { id: 'f5', question: 'How is fair play enforced?', answer: 'A certified referee panel oversees every match, supported by a digital move-review system available for any disputed play.' },
  { id: 'f6', question: 'How can my organization become a sponsor?', answer: 'Reach out through the Contact page — our partnerships team will follow up with sponsorship tiers and benefits.' },
]

export function FAQSection() {
  return (
    <section className="section-y bg-navy">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="FAQS" title="Answers For Common Questions" tone="dark" />
        <div className="mt-10">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
