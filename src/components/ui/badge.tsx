import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', style, ...props }, ref) => {
  const base = 'inline-flex items-center rounded-lg px-4.5 py-2.5 text-xs font-semibold tracking-wide transition-colors'
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-[rgba(184,160,220,0.1)] text-[#B8A0DC]',
    secondary: 'bg-[rgba(147,181,225,0.1)] text-[#93B5E1]',
    success: 'bg-[rgba(142,207,176,0.1)] text-[#8ECFB0]',
    warning: 'bg-[rgba(232,201,125,0.1)] text-[#E8C97D]',
    destructive: 'bg-[rgba(232,128,140,0.1)] text-[#E8808C]',
    muted: 'bg-[rgba(176,170,179,0.1)] text-[#B0AAB3]',
    outline: 'border border-current bg-transparent',
  }

  return (
    <span
      ref={ref}
      className={cn(base, variants[variant], className)}
      style={style}
      {...props}
    />
  )
  }
)
Badge.displayName = 'Badge'

export { Badge }
