import type { HTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type DivPropsSafeForMotion = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>

interface CardProps extends DivPropsSafeForMotion {
  children: ReactNode
  hoverLift?: boolean
  tone?: 'light' | 'dark' | 'outline'
}

const toneClasses: Record<NonNullable<CardProps['tone']>, string> = {
  light: 'bg-surface-white border border-black/5 shadow-card',
  dark: 'bg-navy-soft/60 border border-white/10 text-white',
  outline: 'bg-transparent border border-current/15',
}

export function Card({ children, hoverLift = true, tone = 'light', className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('rounded-2xl p-6 sm:p-8', toneClasses[tone], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
