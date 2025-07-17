'use client'

import { usePathname } from 'next/navigation'
import { OnboardingBanner } from './onboarding-banner'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Temporarily disable the banner until Supabase is set up
  const shouldShowBanner = false
  
  return (
    <TooltipProvider>
      {shouldShowBanner && <OnboardingBanner />}
      {children}
      <Toaster 
        position="bottom-right" 
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </TooltipProvider>
  )
} 