import { Container } from '@/components/Container'
import { TrustBarIcon } from './TrustBarIcons'
import type { TrustBarItem } from '@/lib/api/endpoints/content'
import { defaultTrustBarItems } from '@/lib/defaults/homepage'

interface TrustBarProps {
  items: TrustBarItem[]
}

export function TrustBar({ items }: TrustBarProps) {
  const list = items.length > 0 ? items : defaultTrustBarItems

  return (
    <div className="w-full bg-white border-b border-beige-200 shadow-soft">
      <Container>
        <div className="py-4 sm:py-6">
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12">
            {list.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 text-charcoal-700"
              >
                <span className="text-gold-600 flex-shrink-0">
                  <TrustBarIcon iconName={item.icon_name} className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <span className="text-sm sm:text-base font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
