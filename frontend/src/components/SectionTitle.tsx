interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  return (
    <div className={`mb-8 sm:mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-charcoal-900 mb-3 sm:mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}

