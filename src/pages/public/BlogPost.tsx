import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useBlogPost } from '@/hooks/useBlogPosts'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { articleJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'
import NotFound from '@/pages/public/NotFound'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPost(slug)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size={28} className="text-primary" />
      </div>
    )
  }

  if (!post) return <NotFound />

  const jsonLd = articleJsonLd({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    datePublished: post.published_at ?? post.created_at,
    slug: post.slug,
  })

  return (
    <>
      <Helmet>
        <title>{post.title} — {SITE_NAME}</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`${SITE_URL}/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="section-y bg-surface-white">
        <div className="container-page max-w-3xl">
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary">
            <ArrowLeft size={16} />
            Back to blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-muted uppercase">
              {formatDate(post.published_at ?? post.created_at)} &middot; {post.author}
            </p>
            <h1 className="text-h1 mt-3 text-ink">{post.title}</h1>
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="mt-8 aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary/15 to-navy/10" />
            )}
            <div className="text-body-lg mt-8 flex flex-col gap-5 text-ink/80">
              {post.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </article>
    </>
  )
}
