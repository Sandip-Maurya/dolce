import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { Button } from '@/components/Button'
import type { CorporateGiftingSection as CorporateGiftingSectionType } from '@/lib/api/endpoints/content'
import { defaultCorporateGifting } from '@/lib/defaults/homepage'

interface CorporateGiftingBandProps {
  data: CorporateGiftingSectionType | null
}

export function CorporateGiftingBand({ data }: CorporateGiftingBandProps) {
  const section = data ?? defaultCorporateGifting
  const features = section.features ?? defaultCorporateGifting.features

  return (
    <Container>
      <div className="py-12 sm:py-16 text-beige-100">
        <SectionTitle
          title={section.title}
          subtitle={section.description}
          align="center"
          variant="light"
        />
        {Array.isArray(features) && features.length > 0 && (
          <ul className="max-w-2xl mx-auto flex flex-wrap justify-center gap-4 mb-10 list-none text-beige-200">
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-300 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={section.primary_cta_link}>
            <Button
              variant="primary"
              className="w-full sm:w-auto bg-beige-50 text-charcoal-900 hover:bg-white border-beige-200"
            >
              {section.primary_cta_text}
            </Button>
          </Link>
          <a
            href={section.secondary_cta_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="secondary"
              className="w-full sm:w-auto border-beige-200 text-beige-50 hover:bg-beige-800/50"
            >
              {section.secondary_cta_text}
            </Button>
          </a>
        </div>
      </div>
    </Container>
  )
}
