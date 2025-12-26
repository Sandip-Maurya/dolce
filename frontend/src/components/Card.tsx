import type { ReactNode } from 'react'

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
        <div className="aspect-square w-full overflow-hidden bg-beige-100">
          <img
            src={imageUrl}
            alt={imageAlt || ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

