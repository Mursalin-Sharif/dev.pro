import { useEffect, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  CalendarDays,
  Globe2,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { PageHero } from '@/components/layout/PageHero'
import { FormField } from '@/components/forms/FormField'
import { CountrySelect } from '@/components/forms/CountrySelect'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useRegistrationForEmail, useUpdateMyRegistration } from '@/hooks/useRegistrations'
import { useRegistrantStore } from '@/store/registrantStore'
import { profileUpdateSchema, type ProfileUpdateSchema } from '@/lib/validators'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import type { RegistrationStatus } from '@/types'

const statusTone: Record<RegistrationStatus, 'success' | 'warning' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'neutral',
  refunded: 'neutral',
}

const statusLabel: Record<RegistrationStatus, string> = {
  paid: 'Entry confirmed',
  pending: 'Payment pending',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

function initials(first?: string, last?: string, email?: string | null) {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return 'HG'
}

export default function Account() {
  const navigate = useNavigate()
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    isPaidPlayer,
    registration: authRegistration,
    refreshRegistration,
    signOut,
  } = useAuth()
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)
  const { data: queriedRegistration, isLoading: regLoading } = useRegistrationForEmail(user?.email)
  const registration = authRegistration ?? queriedRegistration ?? null
  const updateProfile = useUpdateMyRegistration()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateSchema>({ resolver: zodResolver(profileUpdateSchema) })

  useEffect(() => {
    if (registration?.id) setRegistrantId(registration.id)
  }, [registration?.id, setRegistrantId])

  useEffect(() => {
    if (!registration) return
    reset({
      firstName: registration.first_name,
      lastName: registration.last_name,
      city: registration.city,
      country: registration.country,
      phone: registration.phone,
    })
  }, [registration, reset])

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size={28} className="text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/account' } }} />
  }

  // Player dashboard is only for paid championship entries (admins use /admin).
  if (!authLoading && !regLoading && !isAdmin && !isPaidPlayer) {
    return <Navigate to="/register" replace />
  }

  const onSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const onSubmit = async (values: ProfileUpdateSchema) => {
    if (!registration?.id) return
    try {
      await updateProfile.mutateAsync({
        id: registration.id,
        first_name: values.firstName,
        last_name: values.lastName,
        city: values.city,
        country: values.country,
        phone: values.phone,
      })
      await refreshRegistration()
      toast.success('Player profile updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update your profile.')
    }
  }

  if (regLoading || !registration) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size={28} className="text-primary" />
      </div>
    )
  }

  const displayName = `${registration.first_name} ${registration.last_name}`

  return (
    <>
      <Helmet>
        <title>Player Profile — {SITE_NAME}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${SITE_URL}/account`} />
      </Helmet>

      <PageHero
        eyebrow="PLAYER PROFILE"
        title="Championship roster"
        subtitle="Your entry is confirmed. This is your official Hopeland player profile for the season."
      />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-4xl">
          <div className="flex flex-col gap-8">
              {/* Identity strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl bg-navy text-white shadow-card"
              >
                <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      background:
                        'radial-gradient(circle at 12% 20%, rgba(56,189,248,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(14,165,233,0.25), transparent 36%)',
                    }}
                  />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl font-display font-extrabold text-primary ring-2 ring-primary/40">
                        {initials(registration.first_name, registration.last_name, user?.email)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-eyebrow text-primary">World Championship</p>
                        <h2 className="text-h2 mt-1 break-words text-white">{displayName}</h2>
                        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-white/70">
                          <Mail size={14} className="shrink-0" />
                          <span className="min-w-0 break-all">{user?.email}</span>
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone[registration.status]} className="self-start bg-white/10 text-white">
                      {statusLabel[registration.status]}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Detail icon={<MapPin size={16} />} label="City" value={registration.city} />
                <Detail icon={<Globe2 size={16} />} label="Country" value={registration.country} />
                <Detail icon={<Phone size={16} />} label="Phone" value={registration.phone} />
                <Detail
                  icon={<CalendarDays size={16} />}
                  label="Date of birth"
                  value={formatDate(registration.date_of_birth)}
                />
                <Detail
                  icon={<Trophy size={16} />}
                  label="Entry fee"
                  value={formatCurrency(registration.fee_amount, registration.fee_currency)}
                />
                <Detail
                  icon={<UserRound size={16} />}
                  label="Registered"
                  value={formatDate(registration.created_at)}
                />
              </motion.div>

              <motion.form
                id="edit-details"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-card sm:p-8"
              >
                <div>
                  <h3 className="text-h3 text-ink">Update player details</h3>
                  <p className="mt-1 text-sm text-muted">Keep your contact information accurate for organizers.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                  <FormField label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="City" error={errors.city?.message} {...register('city')} />
                  <CountrySelect label="Country" error={errors.country?.message} {...register('country')} />
                </div>
                <FormField label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
                  >
                    {isSubmitting ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </motion.form>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-6">
                {isAdmin ? (
                  <Link to="/admin" className="text-sm font-semibold text-primary hover:underline">
                    Open admin dashboard
                  </Link>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
        </div>
      </section>
    </>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-card">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
