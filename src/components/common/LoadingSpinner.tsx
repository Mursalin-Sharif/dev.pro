import { cn } from '@/lib/utils'

export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-spin rounded-full border-2 border-current/20 border-t-current', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-black/5', className)} />
}
