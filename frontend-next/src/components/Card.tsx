import type { ReactNode } from 'react'
import Image from 'next/image'

interface CardProps {
  children: ReactNode
  className?: string
  imageUrl?: string
  imageAlt?: string
  hoverable?: boolean
}

export function Card({
  children,
  className = '',
  imageUrl,
  imageAlt,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 ${
        hoverable ? 'hover:shadow-card-hover hover:-translate-y-1' : ''
      } ${className}`}
    >
      {imageUrl && (
        <div className="relative aspect-square w-full overflow-hidden bg-beige-100">
          <Image
            src={imageUrl}
            alt={imageAlt || ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}
