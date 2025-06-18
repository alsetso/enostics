'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LabelProps {
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function Label({ htmlFor, className, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {children}
    </label>
  )
} 