import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'block text-[0.8rem] font-bold text-white/60 mb-2',
        className
      )}
      {...props}
    />
  )
})
Label.displayName = 'Label'

export { Label }
