// components/ui/ImageWithFallback.tsx
"use client"

import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  width?: number
  height?: number
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  fallback,
  width,
  height 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">📷</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      width={width}
      height={height}
    />
  )
}