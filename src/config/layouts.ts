export type LayoutVariant = 'homepage' | 'auth' | 'docs' | 'public' | 'dashboard'
export type NavbarVariant = 'default' | 'homepage' | 'dashboard' | 'docs' | 'none'
export type ContainerType = 'full-screen' | 'contained' | 'wide' | 'tight'

export interface LayoutConfig {
  navbarVariant: NavbarVariant
  container: ContainerType
  background?: 'media' | 'gradient' | 'solid'
  sidebar?: boolean
  padding?: string
  className?: string
}

export const layoutConfigs: Record<LayoutVariant, LayoutConfig> = {
  homepage: {
    navbarVariant: 'homepage',
    container: 'full-screen',
    background: 'media',
    sidebar: false,
    padding: '',
    className: 'h-screen overflow-hidden bg-enostics-gray-950 text-white relative'
  },
  dashboard: {
    navbarVariant: 'dashboard',
    container: 'contained',
    sidebar: true,
    padding: 'flex-1 px-4 py-8 pb-16 lg:pl-8',
    className: 'min-h-screen bg-enostics-black text-white'
  },
  docs: {
    navbarVariant: 'docs',
    container: 'wide',
    sidebar: false,
    padding: 'container mx-auto px-6',
    className: 'min-h-screen bg-gradient-to-br from-enostics-gray-950 via-enostics-gray-900 to-black text-white'
  },
  public: {
    navbarVariant: 'default',
    container: 'contained',
    sidebar: false,
    padding: 'container mx-auto px-6 py-8',
    className: 'min-h-screen bg-enostics-black text-white'
  },
  auth: {
    navbarVariant: 'none',
    container: 'tight',
    sidebar: false,
    padding: '',
    className: 'h-full bg-enostics-black bg-grid'
  }
}

export const containerStyles: Record<ContainerType, string> = {
  'full-screen': 'w-full h-full',
  'contained': 'max-w-7xl mx-auto px-6',
  'wide': 'max-w-8xl mx-auto px-8',
  'tight': 'max-w-md mx-auto px-4'
}

// Responsive breakpoints for future use
export const breakpoints = {
  sm: '(max-width: 640px)',
  md: '(min-width: 641px) and (max-width: 1024px)',
  lg: '(min-width: 1025px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
}

// Spacing configurations
export const spacing = {
  page: 'px-6 py-8',
  tight: 'px-4 py-4',
  wide: 'px-8 py-12',
  section: 'py-16',
  component: 'p-6'
}

// Future theme system preparation
export const themeConfig = {
  colors: {
    primary: 'enostics-blue',
    secondary: 'enostics-purple',
    success: 'enostics-green',
    warning: 'enostics-amber',
    error: 'enostics-red',
    info: 'enostics-blue'
  },
  modes: {
    light: {
      background: 'white',
      text: 'gray-900',
      surface: 'gray-50'
    },
    dark: {
      background: 'enostics-black',
      text: 'white',
      surface: 'enostics-gray-900'
    }
  }
} 