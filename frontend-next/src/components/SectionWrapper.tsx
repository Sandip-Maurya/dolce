import { cn } from '@/lib/utils'

export type SectionWrapperVariant = 'default' | 'muted' | 'accent' | 'dark'

export interface SectionWrapperProps {
  children: React.ReactNode
  variant?: SectionWrapperVariant
  showTopDivider?: boolean
  showBottomDivider?: boolean
  dividerStyle?: 'gold' | 'border'
  className?: string
  id?: string
}

const variantStyles: Record<SectionWrapperVariant, string> = {
  default: 'bg-white shadow-section',
  muted: 'bg-beige-50',
  accent: 'bg-white border-t-2 border-gold-300/40 shadow-section',
  dark: 'bg-charcoal-900 text-beige-100',
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center py-4 sm:py-6 opacity-80" aria-hidden>
      <div className="h-px w-16 bg-gold-300" />
      <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gold-300" />
      <div className="h-px w-16 bg-gold-300" />
    </div>
  )
}

function BorderDivider() {
  return <div className="border-t border-beige-200" aria-hidden />
}

export function SectionWrapper({
  children,
  variant = 'default',
  showTopDivider = false,
  showBottomDivider = false,
  dividerStyle = 'gold',
  className,
  id,
}: SectionWrapperProps) {
  const baseStyles = 'w-full'
  const paddingStyles = 'py-16 sm:py-20 lg:py-24'
  const variantClass = variantStyles[variant]
  const Divider = dividerStyle === 'gold' ? GoldDivider : BorderDivider

  return (
    <section
      id={id}
      className={cn(baseStyles, paddingStyles, variantClass, className)}
    >
      {showTopDivider && <Divider />}
      <div className={cn(showTopDivider && 'pt-0', showBottomDivider && 'pb-0')}>
        {children}
      </div>
      {showBottomDivider && <Divider />}
    </section>
  )
}
