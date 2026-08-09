import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { LogOut, Loader2, UserRound } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { FormField } from '@/components/forms/FormField'
import { CountrySelect } from '@/components/forms/CountrySelect'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useMyRegistration, useUpdateMyRegistration } from '@/hooks/useRegistrations'
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

export default function Profile() {
  const navigate = useNavigate()
  const registrantId = useRegistrantStore((s) => s.registrantId)
  const clearRegistrantId = useRegistrantStore((s) => s.clearRegistrantId)
  const { data: registration, isLoading } = useMyRegistration(registrantId)
  const updateProfile = useUpdateMyRegistration()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateSchema>({ resolver: zodResolver(profileUpdateSchema) })

  useEffect(() => {
    if (registration) {
      reset({
        firstName: registration.first_name,
        lastName: registration.last_name,
        city: registration.city,
        country: registration.country,
        phone: registration.phone,
      })
    }
  }, [registration, reset])

  const onSubmit = async (values: ProfileUpdateSchema) => {
    if (!registrantId) return
    try {
      await updateProfile.mutateAsync({
        id: registrantId,
        first_name: values.firstName,
        last_name: values.lastName,
        city: values.city,
        country: values.country,
        phone: values.phone,
      })
      toast.success('Your profile has been updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update your profile. Please try again.')
    }
  }

  const onSignOut = () => {
    clearRegistrantId()
    navigate('/')
  }

  return (
    <>
      <Helmet>
        <title>My Profile — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/profile`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageHero eyebrow="MY ACCOUNT" title="My Profile" subtitle="Review your registration details and keep your information up to date." />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-2xl">
          {!registrantId ? (
            <div className="rounded-2xl border border-black/5 bg-white p-10 text-center shadow-card">
              <UserRound size={40} className="mx-auto text-muted" />
              <h2 className="text-h3 mt-4 text-ink">No saved registration on this device</h2>
              <p className="mt-2 text-sm text-muted">
                Register for the championship to create your profile, or if you already registered, use the same device and browser you registered with.
              </p>
              <Link to="/register" className="mt-6 inline-block">
                <Button size="lg">Register Now</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : !registration ? (
            <div className="rounded-2xl border border-black/5 bg-white p-10 text-center shadow-card">
              <h2 className="text-h3 text-ink">We couldn&rsquo;t find that registration</h2>
              <p className="mt-2 text-sm text-muted">It may have been removed. Try registering again.</p>
              <Link to="/register" className="mt-6 inline-block">
                <Button size="lg">Register Now</Button>
              </Link>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-card">
                <div>
                  <p className="text-sm font-bold text-ink">{registration.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    Registered {formatDate(registration.created_at)} &middot; Fee {formatCurrency(registration.fee_amount, registration.fee_currency)}
                  </p>
                </div>
                <Badge tone={statusTone[registration.status]}>{registration.status}</Badge>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-card sm:p-8">
                <h2 className="text-h3 text-ink">Edit your details</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                  <FormField label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="City" error={errors.city?.message} {...register('city')} />
                  <CountrySelect label="Country" error={errors.country?.message} {...register('country')} />
                </div>
                <FormField label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />

                <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
                  >
                    <LogOut size={15} />
                    Forget this device
                  </button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
                  >
                    {isSubmitting ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
