import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { BlogPost } from '@/types'
import { formatDate } from '@/lib/utils'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-card"
      >
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="mb-4 aspect-[16/9] rounded-xl bg-gradient-to-br from-primary/15 to-navy/10" />
          )}
          <p className="text-xs font-semibold text-muted uppercase">{formatDate(post.published_at ?? post.created_at)}</p>
          <h3 className="text-h3 mt-2 text-ink">{post.title}</h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
            Read more
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
      </motion.div>
    </Link>
  )
}
