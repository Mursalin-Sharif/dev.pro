import { Quote } from 'lucide-react'
import type { TestimonialItem } from '@/types'

export function TestimonialCard({
  testimonial,
}: {
  testimonial: TestimonialItem
  index?: number
}) {
  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-card">
      <Quote className="text-primary/40" size={28} />
      <p className="mt-4 flex-1 text-body-lg text-ink/80">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {testimonial.avatarInitials}
        </span>
        <div>
          <p className="text-sm font-bold text-ink">{testimonial.name}</p>
          <p className="text-xs text-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}
