'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  className?: string
  children: ReactNode
}

interface AvatarFallbackProps {
  className?: string
  children: ReactNode
}

export function Avatar({ className, children }: AvatarProps) {
  return (
    <div className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}>
      {children}
    </div>
  )
}

export function AvatarFallback({ className, children }: AvatarFallbackProps) {
  return (
    <div className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}>
      {children}
    </div>
  )
} 