import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, CreditCard, Clock, TrendingUp } from 'lucide-react'
import { useRegistrations, useRegistrationStats } from '@/hooks/useRegistrations'
import { useVideos } from '@/hooks/useVideos'
import { useSponsors } from '@/hooks/useSponsors'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function Dashboard() {
  const { data: registrations, isLoading } = useRegistrations()
  const stats = useRegistrationStats(registrations)
  const { data: videos } = useVideos({ publishedOnly: false })
  const { data: sponsors } = useSponsors()
  const { data: posts } = useBlogPosts({ publishedOnly: false })

  const cards = [
    { icon: Users, label: 'Total Registrations', value: stats.total, tone: 'text-primary bg-primary/10' },
    { icon: CreditCard, label: 'Paid Registrations', value: stats.paid, tone: 'text-success bg-success/10' },
    { icon: Clock, label: 'Pending Payment', value: stats.pending, tone: 'text-warning bg-warning/10' },
    { icon: TrendingUp, label: 'Revenue', value: formatCurrency(stats.revenue, stats.currency), tone: 'text-info bg-info/10' },
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — Hopeland Global Checkers</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">An overview of registrations, content, and championship activity.</p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <motion.div
            key={card.label}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-card"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
              <card.icon size={20} />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-ink">{card.value}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <p className="text-sm font-bold text-ink">Content Library</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
            <li>{videos?.length ?? 0} videos</li>
            <li>{sponsors?.length ?? 0} sponsors</li>
            <li>{posts?.length ?? 0} blog posts</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-card lg:col-span-2">
          <p className="mb-4 text-sm font-bold text-ink">Recent Registrations</p>
          {isLoading ? (
            <LoadingSpinner size={22} className="text-primary" />
          ) : (
            <ul className="flex flex-col divide-y divide-black/5">
              {(registrations ?? []).slice(0, 5).map((registration) => (
                <li key={registration.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold text-ink">
                    {registration.first_name} {registration.last_name}
                  </span>
                  <span className="text-muted">{registration.country}</span>
                  <span className="text-xs text-muted">{formatDate(registration.created_at)}</span>
                </li>
              ))}
              {(registrations ?? []).length === 0 && <p className="py-4 text-center text-sm text-muted">No registrations yet.</p>}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
