interface BadgeProps {
  label: string
  type?: 'organic' | 'eco-friendly' | 'sugar-free' | 'artisan' | 'custom'
  customColor?: string
  customBg?: string
}

export function Badge({
  label,
  type = 'custom',
  customColor,
  customBg,
}: BadgeProps) {
  const typeStyles = {
    organic: 'bg-green-50 text-green-700 border-green-200',
    'eco-friendly': 'bg-amber-50 text-amber-800 border-amber-200',
    'sugar-free': 'bg-beige-100 text-charcoal-700 border-beige-300',
    artisan: 'bg-gold-50 text-gold-800 border-gold-300',
    custom: '',
  }

  const baseStyles =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wide'

  return (
    <span
      className={`${baseStyles} ${typeStyles[type] || ''}`}
      style={
        type === 'custom' && customColor && customBg
          ? {
              backgroundColor: customBg,
              color: customColor,
              borderColor: customColor,
            }
          : undefined
      }
    >
      {label}
    </span>
  )
}

