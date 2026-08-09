import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/common/Button'
import { BlogCard } from '@/components/cards/BlogCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { slideByIndex, staggerContainer, viewportOnce } from '@/lib/motion'

export function BlogPreviewSection() {
  const { data: posts, isLoading } = useBlogPosts()

  return (
    <section className="section-y bg-surface-light">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="LATEST UPDATES"
            title="News From The Championship"
            align="left"
            className="mx-0 text-left"
          />
          <Link to="/blog" className="shrink-0">
            <Button variant="outline" size="sm" icon={<ArrowRight size={16} />}>
              All posts
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={28} className="text-primary" />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {(posts ?? []).slice(0, 3).map((post, i) => (
              <motion.div key={post.id} variants={slideByIndex(i)}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
