import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageHero } from '@/components/layout/PageHero'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Signup() {
  const { isAuthenticated, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/account" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: signUpError, signedIn } = await signUp(email, password)
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError)
      return
    }

    if (signedIn) {
      toast.success('Account created.')
      navigate('/account')
      return
    }

    toast.success('Account created. Confirm your email if required, then sign in.')
    navigate('/login')
  }

  return (
    <>
      <Helmet>
        <title>Create Account — {SITE_NAME}</title>
        <meta name="description" content="Create a Hopeland Global Checkers member account." />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
      </Helmet>

      <PageHero
        eyebrow="JOIN HOPELAND"
        title="Create Account"
        subtitle="Sign up with your email and password to save your place on the platform."
      />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-card sm:p-8"
          >
            {!isSupabaseConfigured && (
              <p className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-xs font-semibold text-warning">
                Supabase is not configured yet — add credentials to .env to enable signup.
              </p>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <FormField
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormField
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormField
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <p className="text-xs font-semibold text-error">{error}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="mt-2 w-full"
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              >
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
