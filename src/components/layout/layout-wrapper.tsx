'use client'

import { usePathname } from 'next/navigation'
import { OnboardingBanner } from './onboarding-banner'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Pages where we don't want to show the onboarding banner
  const excludedPaths = [
    '/register',
    '/login', 
    '/onboarding',
    '/auth/callback'
  ]
  
  // Check if current path should show the banner
  const shouldShowBanner = !excludedPaths.some(path => pathname.startsWith(path))
  
  return (
    <>
      {shouldShowBanner && <OnboardingBanner />}
      {children}
    </>
  )
} 