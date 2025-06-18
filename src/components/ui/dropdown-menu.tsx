"use client"

import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: ReactNode
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: ReactNode
  className?: string
  align?: 'start' | 'end'
}

interface DropdownMenuItemProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

interface DropdownMenuLabelProps {
  children: ReactNode
  className?: string
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {children}
    </div>
  )
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div onClick={() => setIsOpen(!isOpen)}>
      {children}
    </div>
  )
}

export function DropdownMenuContent({ children, className, align = 'end' }: DropdownMenuContentProps) {
  return (
    <div className={cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      align === 'end' ? 'right-0' : 'left-0',
      'top-full mt-1',
      className
    )}>
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, className, onClick }: DropdownMenuItemProps) {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn('px-2 py-1.5 text-sm font-semibold', className)}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} />
} 