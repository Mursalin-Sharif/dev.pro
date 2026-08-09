import type { SelectHTMLAttributes } from 'react'
import { countries } from '@/lib/countries'
import { cn } from '@/lib/utils'

interface CountrySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function CountrySelect({ label, error, className, id, ...props }: CountrySelectProps) {
  const fieldId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-bold text-ink">
        {label}
      </label>
      <select
        id={fieldId}
        className={cn(
          'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-error focus:border-error focus:ring-error/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      >
        <option value="">Select your country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${fieldId}-error`} className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}
