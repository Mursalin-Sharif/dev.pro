import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { supabase } from '@/lib/supabaseClient'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useRegistrantStore } from '@/store/registrantStore'
import { activatePaidAccount } from '@/lib/activatePaidAccount'
import { mockRegistrations } from '@/lib/mockData'
import type { Registration } from '@/types'

const MAX_POLL_TIME_MS = 20_000
const POLL_INTERVAL_MS = 1_800

export default function RegisterSuccess() {
  const [params] = useSearchParams()
  const isDemo = params.get('demo') === 'true'
  const sessionId = params.get('session_id')
  const registrantId = useRegistrantStore((s) => s.registrantId)
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)
  const [timedOut, setTimedOut] = useState(false)
  const [accountReady, setAccountReady] = useState(false)

  const needsLookup = !isDemo && Boolean(sessionId) && !registrantId
  const pollActive = needsLookup && !timedOut

  useEffect(() => {
    if (!needsLookup) return
    const timer = setTimeout(() => setTimedOut(true), MAX_POLL_TIME_MS)
    return () => clearTimeout(timer)
  }, [needsLookup])

  const { data: registration } = useQuery({
    queryKey: ['register-success-lookup', sessionId, isDemo, registrantId],
    enabled: isDemo || Boolean(sessionId) || Boolean(registrantId),
    refetchInterval: pollActive ? POLL_INTERVAL_MS : false,
    queryFn: async (): Promise<Registration | null> => {
      if (isDemo) {
        return mockRegistrations.find((r) => r.id === registrantId) ?? mockRegistrations[0] ?? null
      }
      if (sessionId) {
        const { data, error } = await supabase.functions.invoke<Registration>('get-registration-by-session', {
          body: { sessionId },
        })
        if (error) return null
        return data ?? null
      }
      return null
    },
  })

  useEffect(() => {
    if (registration?.id) setRegistrantId(registration.id)
  }, [registration, setRegistrantId])

  // Create login account only after paid registration exists in DB.
  useEffect(() => {
    if (!registration || registration.status !== 'paid' || accountReady) return
    let cancelled = false
    void (async () => {
      await activatePaidAccount(registration)
      if (!cancelled) setAccountReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [registration, accountReady])

  const stillConfirming = pollActive && !registration
  const confirmed = Boolean(registration?.status === 'paid') || (isDemo && Boolean(registrantId))

  return (
    <>
      <Helmet>
        <title>Registration Confirmed — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/register/success`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex min-h-[70vh] items-center bg-surface-white">
        <div className="container-page max-w-lg text-center">
          {stillConfirming ? (
            <>
              <LoadingSpinner size={40} className="mx-auto text-primary" />
              <h1 className="text-h1 mt-8 text-ink">Confirming your payment…</h1>
              <p className="text-body-lg mt-4 text-muted">
                We only save your registration after Stripe confirms payment. Please don&rsquo;t close this page.
              </p>
            </>
          ) : confirmed ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h1 className="text-h1 mt-8 text-ink">Registration confirmed</h1>
              <p className="text-body-lg mt-4 text-muted">
                {isDemo
                  ? 'Demo payment success — your player is saved locally and will show in the admin list.'
                  : 'Payment successful. Your player info is now in our database, visible on the admin dashboard, and you can sign in with the email and password you set.'}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/login">
                  <Button size="lg">Sign In to Player Profile</Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-h1 mt-8 text-ink">Payment not confirmed yet</h1>
              <p className="text-body-lg mt-4 text-muted">
                We don&rsquo;t save registrations without a successful payment. Please register again and complete checkout.
              </p>
              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg">Register Again</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
