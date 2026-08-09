import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import { FormField } from '@/components/forms/FormField'
import { CountrySelect } from '@/components/forms/CountrySelect'
import { Button } from '@/components/common/Button'
import { registrationSchema, type RegistrationSchema } from '@/lib/validators'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { registrationFee } from '@/lib/stripeClient'
import { formatCurrency } from '@/lib/utils'
import { savePendingAuth, clearPendingAuth } from '@/lib/pendingAuth'
import { useCreateDemoRegistration } from '@/hooks/useRegistrations'
import { useRegistrantStore } from '@/store/registrantStore'

/** Turns raw Supabase Edge Function errors into a message a registrant can act on. */
async function getRegistrationErrorMessage(err: unknown): Promise<string> {
  if (err instanceof FunctionsHttpError) {
    try {
      const body = await err.context.json()
      if (typeof body?.error === 'string') return body.error
    } catch {
      // fall through
    }
    return 'Could not start checkout. Please try again.'
  }
  if (err instanceof FunctionsRelayError || err instanceof FunctionsFetchError) {
    return 'Payments aren\u2019t set up yet — the checkout service isn\u2019t reachable. Please try again shortly or contact support.'
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

export function RegistrationForm() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const createDemoRegistration = useCreateDemoRegistration()
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationSchema>({ resolver: zodResolver(registrationSchema) })

  const onSubmit = async (values: RegistrationSchema) => {
    setSubmitting(true)
    try {
      // Demo mode only — simulates a successful paid registration locally.
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 900))
        const registration = await createDemoRegistration.mutateAsync({
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: values.dateOfBirth,
          city: values.city,
          country: values.country,
          phone: values.phone,
          email: values.email,
        })
        setRegistrantId(registration.id)
        savePendingAuth(values.email, values.password)
        toast.success('Demo mode: paid registration saved locally.')
        navigate('/register/success?demo=true')
        return
      }

      // Live mode: NOTHING is written to the registrations DB until Stripe
      // confirms payment (webhook). Password stays in sessionStorage only.
      clearPendingAuth()
      savePendingAuth(values.email, values.password)

      const { password: _password, confirmPassword: _confirm, ...checkoutFields } = values

      // 1) Local Vite checkout (/api/…) when STRIPE_SECRET_KEY is in .env (dev).
      // 2) Fall back to Supabase Edge Function for production / hosted deploys.
      let checkoutUrl: string | null = null

      try {
        const localRes = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutFields),
        })
        if (localRes.ok) {
          const localData = (await localRes.json()) as { url?: string; error?: string }
          if (localData.url) checkoutUrl = localData.url
          else if (localData.error) throw new Error(localData.error)
        } else if (localRes.status !== 404) {
          const localData = (await localRes.json().catch(() => ({}))) as { error?: string }
          if (localData.error && localRes.status !== 503) throw new Error(localData.error)
        }
      } catch (err) {
        if (err instanceof Error && !/Failed to fetch|NetworkError|fetch/i.test(err.message)) {
          throw err
        }
      }

      if (!checkoutUrl) {
        const { data, error } = await supabase.functions.invoke<{ url: string; error?: string }>(
          'create-checkout-session',
          { body: checkoutFields },
        )
        if (error || !data?.url) {
          clearPendingAuth()
          throw error ?? new Error(data?.error ?? 'Could not start checkout. Please try again.')
        }
        checkoutUrl = data.url
      }

      window.location.href = checkoutUrl
    } catch (err) {
      clearPendingAuth()
      toast.error(await getRegistrationErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs text-muted">
        Your details are saved to our database <span className="font-semibold text-ink">only after payment succeeds</span>.
        If payment fails or is cancelled, nothing is registered — you can try again.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First Name" placeholder="Amara" error={errors.firstName?.message} {...register('firstName')} />
        <FormField label="Last Name" placeholder="Okafor" error={errors.lastName?.message} {...register('lastName')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
        <FormField label="City" placeholder="Lagos" error={errors.city?.message} {...register('city')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <CountrySelect label="Country" error={errors.country?.message} {...register('country')} />
        <FormField label="Phone Number" type="tel" placeholder="+234 801 234 5678" error={errors.phone?.message} {...register('phone')} />
      </div>

      <FormField label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
      <p className="text-xs text-muted">
        After payment succeeds, this password unlocks <span className="font-semibold text-ink">Sign In</span> for your
        player profile.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-black/10 bg-surface-light px-5 py-4">
        <div>
          <p className="text-sm font-bold text-ink">Registration Fee</p>
          <p className="text-xs text-muted">Charged only when payment completes</p>
        </div>
        <p className="text-h3 text-primary">{formatCurrency(registrationFee.amount, registrationFee.currency)}</p>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full" icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}>
        {submitting ? 'Redirecting to payment…' : 'Register Now'}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck size={14} className="text-success" />
        Payments are securely processed by Stripe. Failed payments create no registration.
      </p>
    </form>
  )
}
