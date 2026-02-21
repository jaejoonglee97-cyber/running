import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-neon-blue text-white shadow-neon-blue active:scale-95',
        orange:
          'bg-gradient-neon-orange text-white shadow-[0_0_20px_rgba(255,158,0,0.5)] active:scale-95',
        outline:
          'border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10',
        ghost: 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white',
        glass:
          'border border-white/10 bg-[rgba(20,20,20,0.7)] backdrop-blur-xl text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]',
        destructive:
          'bg-[rgba(255,80,80,0.15)] border border-[rgba(255,80,80,0.3)] text-[#ff5050] hover:bg-[rgba(255,80,80,0.25)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-11 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-9 w-9 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
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
