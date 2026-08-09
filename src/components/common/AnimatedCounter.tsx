import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

export function AnimatedCounter({ target, suffix, className }: { target: number; suffix?: string; className?: string }) {
  const ref = useCountUp(target, { suffix })
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      0{suffix}
    </span>
  )
}
