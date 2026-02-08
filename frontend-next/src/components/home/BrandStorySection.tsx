import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { Button } from '@/components/Button'
import type { BrandStorySection as BrandStorySectionType } from '@/lib/api/endpoints/content'
import { defaultBrandStory } from '@/lib/defaults/homepage'

interface BrandStorySectionProps {
  data: BrandStorySectionType | null
}

export function BrandStorySection({ data }: BrandStorySectionProps) {
  const section = data ?? defaultBrandStory
  const features = section.features ?? defaultBrandStory.features

  return (
    <Container>
      <SectionTitle
        title={section.title}
        subtitle={section.subtitle}
        align="center"
      />
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
        {Array.isArray(features) && features.length > 0 && (
          <ul className="text-charcoal-700 text-base sm:text-lg space-y-2 list-none">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        <Link href={section.cta_link}>
          <Button variant="secondary" className="mt-4">
            {section.cta_text}
          </Button>
        </Link>
      </div>
    </Container>
  )
}
