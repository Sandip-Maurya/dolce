import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { Button } from '@/components/Button'

export function BrandStorySection() {
  return (
    <Container>
      <SectionTitle
        title="Why Dolce Fiore"
        subtitle="Health-first indulgence, artisan-made, and packaging that becomes part of the gift."
        align="center"
      />
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
        <ul className="text-charcoal-700 text-base sm:text-lg space-y-2 list-none">
          <li className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
            Health-first indulgence — sugar-free and guilt-free without compromise
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
            Artisan-made with local partners across India
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
            Reusable, eco packaging that&apos;s part of the gift
          </li>
        </ul>
        <Link href="/about">
          <Button variant="secondary" className="mt-4">
            Read the full story
          </Button>
        </Link>
      </div>
    </Container>
  )
}
