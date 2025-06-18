'use client'

import { ReactNode } from 'react'
import { GlobalNavbar } from './global-navbar'
import { BackgroundMedia } from '@/components/ui/background-media'
import { homepageConfig } from '@/config/homepage'

interface PageWrapperProps {
  variant: 'homepage' | 'auth' | 'docs' | 'public' | 'dashboard'
  navbarVariant?: 'default' | 'homepage' | 'dashboard' | 'docs' | 'none'
  className?: string
  children: ReactNode
  // Layout slot props
  sidebar?: ReactNode
  footer?: ReactNode
  // Homepage-specific props
  showBackground?: boolean
  onMobileMenuClick?: () => void
}

const variantStyles = {
  homepage: {
    container: 'h-screen overflow-hidden bg-enostics-gray-950 text-white relative',
    content: 'flex h-full pt-20 relative',
    padding: '',
    hasSidebar: false
  },
  auth: {
    container: 'h-full bg-enostics-black bg-grid',
    content: 'flex h-full',
    padding: '',
    hasSidebar: false
  },
  docs: {
    container: 'min-h-screen bg-gradient-to-br from-enostics-gray-950 via-enostics-gray-900 to-black text-white',
    content: 'pt-20',
    padding: 'container mx-auto px-6',
    hasSidebar: false
  },
  public: {
    container: 'min-h-screen bg-enostics-black text-white',
    content: 'pt-20',
    padding: 'container mx-auto px-6 py-8',
    hasSidebar: false
  },
  dashboard: {
    container: 'min-h-screen bg-enostics-black text-white',
    content: 'flex h-screen',
    padding: 'flex-1 px-4 py-8 pb-16 lg:ml-64',
    hasSidebar: true
  }
}

const getNavbarProps = (variant: string, navbarVariant?: string, onMobileMenuClick?: () => void) => {
  // If navbarVariant is explicitly set, use it
  if (navbarVariant && navbarVariant !== 'none') {
    const props: any = { variant: navbarVariant }
    
    if (navbarVariant === 'homepage' && onMobileMenuClick) {
      props.showMobileMenuButton = true
      props.onMobileMenuClick = onMobileMenuClick
    }
    
    if (navbarVariant === 'dashboard') {
      props.showNotifications = true
      if (onMobileMenuClick) {
        props.showMobileMenuButton = true
        props.onMobileMenuClick = onMobileMenuClick
      }
    }
    
    return props
  }

  // Auto-determine navbar variant based on page variant
  switch (variant) {
    case 'homepage':
      return {
        variant: 'homepage',
        showMobileMenuButton: true,
        onMobileMenuClick
      }
    case 'dashboard':
      return { 
        variant: 'dashboard',
        showNotifications: true,
        showMobileMenuButton: !!onMobileMenuClick,
        onMobileMenuClick
      }
    case 'docs':
      return { variant: 'docs' }
    case 'public':
      return { variant: 'default' }
    case 'auth':
    default:
      return null // No navbar for auth pages by default
  }
}

export function PageWrapper({
  variant,
  navbarVariant,
  className = '',
  children,
  sidebar,
  footer,
  showBackground = false,
  onMobileMenuClick
}: PageWrapperProps) {
  const styles = variantStyles[variant]
  const navbarProps = getNavbarProps(variant, navbarVariant, onMobileMenuClick)
  const shouldShowNavbar = navbarVariant !== 'none' && navbarProps !== null

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Background Media - Only for homepage variant */}
      {variant === 'homepage' && showBackground && (
        <BackgroundMedia 
          type={homepageConfig.background.type}
          path={homepageConfig.background.path}
          mobilePath={homepageConfig.background.mobilePath}
          opacity={homepageConfig.background.opacity}
          className={homepageConfig.background.className}
          videoOptions={homepageConfig.background.video}
        />
      )}

      {/* Sidebar slot - Full height, render first for proper z-index layering */}
      {sidebar && styles.hasSidebar && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 z-40 lg:block hidden">
          {sidebar}
        </aside>
      )}

      {/* Navigation - Positioned after sidebar for dashboard variant */}
      {shouldShowNavbar && <GlobalNavbar {...navbarProps} />}

      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Main Content */}
        <main className={styles.padding ? `${styles.padding}` : 'flex-1'}>
          {children}
        </main>

        {/* Footer slot */}
        {footer}
      </div>
    </div>
  )
} 