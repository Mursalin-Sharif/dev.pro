import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { TimelineItem } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig = {
  done: { icon: CheckCircle2, className: 'text-success' },
  active: { icon: Clock, className: 'text-primary' },
  upcoming: { icon: Circle, className: 'text-white/40' },
}

export function TimelineCard({ item }: { item: TimelineItem; index?: number }) {
  const status = statusConfig[item.status]
  const Icon = status.icon

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-white/10 bg-navy-soft/60 p-6 text-white">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-eyebrow">{item.quarter}</span>
        <Icon size={20} className={status.className} />
      </div>
      <h3 className="text-h3 text-white">{item.title}</h3>
      <ul className="mt-4 flex flex-col gap-2">
        {item.items.map((li) => (
          <li key={li} className={cn('flex items-start gap-2 text-sm', 'text-white/70')}>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {li}
          </li>
        ))}
      </ul>
    </div>
  )
}
