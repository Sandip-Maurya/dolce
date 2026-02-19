interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  variant?: 'default' | 'light'
  className?: string
}

export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  variant = 'default',
  className = '',
}: SectionTitleProps) {
  const titleClass =
    variant === 'light'
      ? 'text-3xl sm:text-4xl lg:text-5xl font-heading text-beige-50 mb-3 sm:mb-4'
      : 'text-3xl sm:text-4xl lg:text-5xl font-heading text-charcoal-900 mb-3 sm:mb-4'
  const subtitleClass =
    variant === 'light'
      ? 'text-base sm:text-lg text-beige-200 max-w-2xl mx-auto'
      : 'text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto'
  return (
    <div className={`mb-8 sm:mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      <h2 className={titleClass}>{title}</h2>
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
    </div>
  )
}
