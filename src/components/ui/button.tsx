import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#B8A0DC] to-[#FADADD] text-white shadow-[0_4px_14px_rgba(184,160,220,0.3)] hover:shadow-[0_6px_20px_rgba(184,160,220,0.4)]',
        destructive:
          'bg-[rgba(232,128,140,0.1)] text-[#E8808C] border border-[rgba(232,128,140,0.2)] hover:bg-[rgba(232,128,140,0.15)]',
        outline:
          'border border-[rgba(232,223,245,0.3)] bg-transparent text-[#6E5A73] hover:bg-[rgba(184,160,220,0.08)]',
        secondary:
          'bg-[rgba(184,160,220,0.1)] text-[#A48CC0] border border-[rgba(184,160,220,0.2)] hover:bg-[rgba(184,160,220,0.15)]',
        ghost:
          'text-[#6E5A73] hover:bg-[rgba(232,223,245,0.15)]',
        success:
          'bg-[rgba(142,207,176,0.15)] text-[#5DB88A] border border-[rgba(142,207,176,0.25)] hover:bg-[rgba(142,207,176,0.2)]',
        muted:
          'bg-[rgba(176,170,179,0.1)] text-[#9A949D] border border-[rgba(176,170,179,0.18)] hover:bg-[rgba(176,170,179,0.15)]',
      },
      size: {
        default: 'h-12 px-6 py-3.5 text-[15px]',
        sm: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
