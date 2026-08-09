import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'

export default function Settings() {
  const { user, role } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast.info('Connect Supabase to enable password changes.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }
      setPassword('')
      setConfirm('')
      toast.success('Password updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Settings — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Settings</h1>
      <p className="mt-1 text-sm text-muted">Manage your admin profile.</p>

      <div className="mt-8 max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-bold text-ink">Account</p>
        <p className="mt-1 text-sm text-muted">{user?.email ?? 'demo@hopeland.local (demo mode)'}</p>
        <p className="mt-2 text-sm text-muted">
          Role:{' '}
          <span className="font-semibold capitalize text-ink">
            {role ?? (isSupabaseConfigured ? '—' : 'admin (demo)')}
          </span>
        </p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 flex flex-col gap-4">
          <FormField
            label="New Password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" className="mt-2" disabled={saving}>
            {saving ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </div>
    </>
  )
}
