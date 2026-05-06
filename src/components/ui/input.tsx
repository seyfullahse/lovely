import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-2xl bg-[#FAFAFA] px-5 py-4 text-[15px] text-[#3D2C3E]',
        'border-[1.5px] border-[#F0ECF5] outline-none',
        'transition-all duration-200',
        'placeholder:text-[#B8A9BC]',
        'focus:border-[#B8A0DC] focus:shadow-[0_0_0_3px_rgba(184,160,220,0.1)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
  }
)
Input.displayName = 'Input'

export { Input }
