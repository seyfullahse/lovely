import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[rgba(61,44,62,0.35)] backdrop-blur-[12px]',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showClose?: boolean
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2',
        'rounded-3xl bg-white p-0 shadow-[0_0_0_1px_rgba(232,223,245,0.12),0_24px_64px_-16px_rgba(61,44,62,0.22),0_8px_20px_-8px_rgba(61,44,62,0.08)]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'duration-300',
        'max-h-[90vh] overflow-y-auto',
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-5 top-5 sm:right-7 sm:top-7 p-3 rounded-xl transition cursor-pointer hover:scale-105 text-[#B8A9BC] bg-[rgba(232,223,245,0.15)] hover:bg-[rgba(232,223,245,0.25)]">
          <FiX size={20} />
          <span className="sr-only">Kapat</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'px-7 sm:px-10 pt-7 sm:pt-9 pb-5',
      'border-b border-[rgba(232,223,245,0.2)]',
      className
    )}
    {...props}
  />
)

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-[1.35rem] font-semibold',
      className
    )}
    style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm mt-1.5 text-[#B8A9BC]', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('px-7 sm:px-10 py-7 sm:py-8', className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('px-7 sm:px-10 pb-7 sm:pb-8 pt-2', className)}
    {...props}
  />
)

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
