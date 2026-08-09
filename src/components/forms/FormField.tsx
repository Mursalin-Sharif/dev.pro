import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  rightIcon?: ReactNode
}

export function FormField({ label, error, rightIcon, className, id, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          className={cn(
            'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
            error && 'border-error focus:border-error focus:ring-error/20',
            rightIcon && 'pr-11',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {rightIcon && <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted">{rightIcon}</span>}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}
