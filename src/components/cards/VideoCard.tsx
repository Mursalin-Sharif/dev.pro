import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { Video } from '@/types'
import { formatDate } from '@/lib/utils'

export function VideoCard({ video, onPlay }: { video: Video; onPlay?: (video: Video) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => onPlay?.(video)}
      whileHover={{ y: -6 }}
      className="group block w-full shrink-0 text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-soft to-navy" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform group-hover:scale-110">
            <Play size={22} className="fill-white text-white" />
          </span>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 break-words text-h3 text-ink">{video.title}</p>
      {video.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{video.description}</p>}
      <p className="mt-2 text-xs font-semibold text-muted uppercase">{formatDate(video.created_at)}</p>
    </motion.button>
  )
}
