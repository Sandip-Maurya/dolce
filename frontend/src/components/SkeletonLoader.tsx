import { type ReactNode } from 'react'

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'image' | 'custom'
  className?: string
  children?: ReactNode
  width?: string | number
  height?: string | number
  rounded?: boolean
  count?: number
}

export function SkeletonLoader({
  type = 'custom',
  className = '',
  children,
  width,
  height,
  rounded = true,
  count = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'shimmer'
  const roundedClass = rounded ? 'rounded' : ''
  
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${roundedClass} ${className}`}
            style={style}
          >
            <div className="aspect-square w-full shimmer"></div>
            <div className="p-6">
              <div className="h-4 shimmer rounded w-3/4 mb-3"></div>
              <div className="h-4 shimmer rounded w-full mb-2"></div>
              <div className="h-4 shimmer rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'text') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${roundedClass} ${className}`}
            style={style}
          />
        ))}
      </>
    )
  }

  if (type === 'image') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${roundedClass} ${className}`}
            style={style}
          />
        ))}
      </>
    )
  }

  // Custom type - render children or default skeleton
  if (children) {
    return <>{children}</>
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${roundedClass} ${className}`}
          style={style}
        />
      ))}
    </>
  )
}

// Pre-built skeleton components for common use cases
export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse"
        >
          <div className="aspect-square w-full shimmer"></div>
          <div className="p-4 sm:p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-16 shimmer rounded"></div>
              <div className="h-5 w-20 shimmer rounded"></div>
            </div>
            <div className="h-6 shimmer rounded w-3/4 mb-3"></div>
            <div className="h-4 shimmer rounded w-full mb-2"></div>
            <div className="h-4 shimmer rounded w-5/6 mb-4"></div>
            <div className="h-4 shimmer rounded w-1/3"></div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-beige-200">
              <div className="h-9 flex-1 shimmer rounded"></div>
              <div className="h-9 flex-1 shimmer rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard count={count} />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 shimmer rounded mb-2 ${
            i === lines - 1 ? 'w-5/6' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonPhotoGallery({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse"
        >
          <div className="aspect-square w-full bg-beige-200 shimmer"></div>
          <div className="p-4">
            <div className="h-4 bg-beige-200 shimmer rounded w-3/4 mx-auto mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonBlogPost({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse"
        >
          <div className="p-6 space-y-4">
            <div className="h-6 bg-beige-200 shimmer rounded w-3/4"></div>
            <div className="h-4 bg-beige-200 shimmer rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-beige-200 shimmer rounded w-full"></div>
              <div className="h-4 bg-beige-200 shimmer rounded w-5/6"></div>
              <div className="h-4 bg-beige-200 shimmer rounded w-4/6"></div>
            </div>
            {i === 0 && (
              <div className="aspect-video w-full bg-beige-200 shimmer rounded mt-4"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

