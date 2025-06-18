// Homepage Background Configuration
// Simply update the values below to change the homepage background

export const homepageConfig = {
  background: {
    // Type: 'image' | 'video' | 'none'
    type: 'image' as 'image' | 'video' | 'none',
    
    // Path to the media file in /public directory
    // For images: '/background.png', '/images/hero.jpg', etc.
    // For videos: '/videos/hero.mp4', '/videos/demo.webm', etc.
    path: '/background2.png',
    
    // Mobile-specific background path
    mobilePath: '/mobile-ship.png',
    
    // Opacity (0-100)
    opacity: 80,
    
    // Additional CSS classes for positioning/effects
    className: 'bg-cover bg-center bg-no-repeat',
    
    // Video-specific options
    video: {
      autoplay: true,
      muted: true,
      loop: true,
      playsInline: true
    }
  }
}

// Quick presets for easy switching
export const backgroundPresets = {
  originalImage: {
    type: 'image' as const,
    path: '/background.png',
    opacity: 80,
    className: 'bg-cover bg-center bg-no-repeat'
  },
  
  newResponsiveImages: {
    type: 'image' as const,
    path: '/background2.png',
    mobilePath: '/mobile-ship.png',
    opacity: 80,
    className: 'bg-cover bg-center bg-no-repeat'
  },
  
  endpointVideo: {
    type: 'video' as const,
    path: '/videos/Set-up your endpoint..mp4',
    opacity: 80,
    className: 'object-cover'
  },
  
  noBackground: {
    type: 'none' as const,
    path: '',
    opacity: 0,
    className: ''
  }
} 