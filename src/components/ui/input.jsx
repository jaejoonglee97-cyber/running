import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-[14px] border border-white/15 bg-white/5 px-4 py-3 text-base font-semibold text-white outline-none transition-[border-color] placeholder:text-white/40 focus:border-neon-blue/50 box-border',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
