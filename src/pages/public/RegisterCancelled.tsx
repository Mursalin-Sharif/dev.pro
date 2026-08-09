import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { clearPendingAuth } from '@/lib/pendingAuth'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function RegisterCancelled() {
  useEffect(() => {
    clearPendingAuth()
  }, [])

  return (
    <>
      <Helmet>
        <title>Payment Cancelled — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/register/cancelled`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex min-h-[70vh] items-center bg-surface-white">
        <div className="container-page max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error"
          >
            <XCircle size={40} />
          </motion.div>
          <h1 className="text-h1 mt-8 text-ink">Payment not completed</h1>
          <p className="text-body-lg mt-4 text-muted">
            You were not registered. Nothing was saved to our database and you were not charged. Please register again
            and finish payment to join the championship.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg">Register Again</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
