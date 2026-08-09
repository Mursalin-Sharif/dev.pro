import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/layout/PageHero'
import { BlogCard } from '@/components/cards/BlogCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts()

  return (
    <>
      <Helmet>
        <title>Blog — {SITE_NAME}</title>
        <meta name="description" content="News, updates, and stories from the Hopeland Global Checkers World Championship." />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Helmet>

      <PageHero eyebrow="COMMUNITY & NEWS" title="Blog" subtitle="Announcements, player spotlights, and everything happening across the championship season." />

      <section className="section-y bg-surface-white">
        <div className="container-page">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {(posts ?? []).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
