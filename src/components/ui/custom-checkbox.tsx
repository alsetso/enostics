'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CustomCheckbox({ 
  checked, 
  onChange, 
  className = '', 
  size = 'sm' 
}: CustomCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  const iconSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  }

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${sizeClasses[size]}
        rounded-sm
        border
        transition-all
        duration-200
        flex
        items-center
        justify-center
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${checked
          ? 'bg-[hsl(var(--hover-bg))] border-[hsl(var(--text-secondary))]'
          : isHovered
          ? 'bg-[hsl(var(--hover-bg))]/50 border-[hsl(var(--text-muted))]'
          : 'bg-transparent border-[hsl(var(--border-color))]'
        }
        hover:border-[hsl(var(--text-secondary))]
        focus:ring-[hsl(var(--text-muted))]/20
        ${className}
      `}
    >
      {checked && (
        <Check 
          className={`
            ${iconSizes[size]}
            text-[hsl(var(--text-primary))]
            transition-opacity
            duration-200
          `}
        />
      )}
    </button>
  )
} 