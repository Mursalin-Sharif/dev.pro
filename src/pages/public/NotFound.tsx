import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { SITE_NAME } from '@/lib/seo'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — {SITE_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex min-h-[70vh] items-center bg-surface-white">
        <div className="container-page text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-display text-primary">
            404
          </motion.p>
          <h1 className="text-h2 mt-4 text-ink">This board square is empty</h1>
          <p className="text-body-lg mx-auto mt-3 max-w-md text-muted">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button size="lg">Back to Home</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
