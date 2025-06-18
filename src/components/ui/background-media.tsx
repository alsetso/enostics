'use client'

import { useEffect, useRef } from 'react'

interface BackgroundMediaProps {
  type: 'image' | 'video' | 'none'
  path: string
  mobilePath?: string
  opacity?: number
  className?: string
  videoOptions?: {
    autoplay?: boolean
    muted?: boolean
    loop?: boolean
    playsInline?: boolean
  }
}

export function BackgroundMedia({ 
  type, 
  path, 
  mobilePath,
  opacity = 80, 
  className = '',
  videoOptions = {}
}: BackgroundMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      const video = videoRef.current
      
      // Ensure video plays on mobile devices
      const playVideo = async () => {
        try {
          await video.play()
        } catch (error) {
          console.log('Video autoplay failed:', error)
        }
      }

      if (videoOptions.autoplay) {
        playVideo()
      }
    }
  }, [type, videoOptions.autoplay])

  if (type === 'none') {
    return null
  }

  const baseClasses = "absolute inset-0 w-full h-full"
  const opacityStyle = { opacity: opacity / 100 }

  if (type === 'image') {
    return (
      <>
        {/* Desktop background */}
        <div 
          className={`${baseClasses} ${className} hidden md:block`}
          style={{
            backgroundImage: `url('${path}')`,
            ...opacityStyle
          }}
        />
        {/* Mobile background */}
        <div 
          className={`${baseClasses} ${className} block md:hidden`}
          style={{
            backgroundImage: `url('${mobilePath || path}')`,
            ...opacityStyle
          }}
        />
      </>
    )
  }

  if (type === 'video') {
    return (
      <video
        ref={videoRef}
        className={`${baseClasses} ${className}`}
        style={opacityStyle}
        autoPlay={videoOptions.autoplay}
        muted={videoOptions.muted}
        loop={videoOptions.loop}
        playsInline={videoOptions.playsInline}
        preload="metadata"
      >
        <source src={path} type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div 
          className={`${baseClasses} bg-cover bg-center bg-no-repeat`}
          style={{
            backgroundImage: `url('/background.png')`,
            ...opacityStyle
          }}
        />
      </video>
    )
  }

  return null
} 