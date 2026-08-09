import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export default function Login() {
  const { isAdmin, signInAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await signInAdmin(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate('/admin')
  }

  return (
    <>
      <Helmet>
        <title>Admin Login — Hopeland Global Checkers</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-navy px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={22} />
            </span>
            <h1 className="text-h3 mt-4 text-ink">Admin Sign In</h1>
            <p className="mt-1 text-sm text-muted">Manage registrations, videos, sponsors, and blog content.</p>
          </div>

          {!isSupabaseConfigured && (
            <p className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-xs font-semibold text-warning">
              Supabase is not configured yet — connect your project in .env to enable real admin authentication.
            </p>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-xs font-semibold text-error">{error}</p>}
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-2 w-full"
              icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  )
}
