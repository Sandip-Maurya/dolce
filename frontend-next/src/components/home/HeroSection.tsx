import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import type { HeroSection as HeroSectionType } from '@/lib/api/endpoints/content'
import { defaultHero } from '@/lib/defaults/homepage'

interface HeroSectionProps {
  data: HeroSectionType | null
}

export function HeroSection({ data }: HeroSectionProps) {
  const hero = data ?? defaultHero
  const imageUrl = hero.background_image_url || defaultHero.background_image_url

  return (
    <section className="w-full mb-0">
      {/* Image block: full-bleed, height from aspect ratio (no max limit) */}
      <div className="relative w-full aspect-[2/1]">
        <Image
          src={imageUrl}
          alt="Premium artisanal gift hampers with organic treats"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Content block: compact card and section, secondary to image */}
      <div className="w-full bg-charcoal-900">
        <Container>
          <div className="relative py-4 sm:py-5 lg:py-6 flex items-center justify-center text-center px-4 w-full">
            <div className="max-w-2xl w-full animate-in fade-in duration-1000 ease-out relative z-10">
              <div className="flex items-center justify-center mb-2 sm:mb-3 opacity-60">
                <div className="h-px w-10 bg-gold-300" />
                <div className="mx-2 w-1 h-1 rounded-full bg-gold-300" />
                <div className="h-px w-10 bg-gold-300" />
              </div>

              <div className="rounded-xl p-4 sm:p-5 border border-white/10 bg-white/5">
                <h1 className="font-heading text-white mb-2 leading-tight tracking-wide text-2xl sm:text-3xl lg:text-4xl">
                  {hero.headline}{' '}
                  <span className="text-gold-300">
                    {hero.highlight_text}
                  </span>
                </h1>

                <p className="text-beige-50 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed px-1">
                  {hero.subheadline}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
                  <Link href={hero.primary_cta_link} className="w-full sm:w-auto group">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-sm font-medium border-2 border-transparent hover:!bg-charcoal-700 hover:!border-gold-300/40"
                    >
                      {hero.primary_cta_text}
                    </Button>
                  </Link>
                  <Link href={hero.secondary_cta_link} className="w-full sm:w-auto group">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-sm font-medium border-2 border-transparent hover:!bg-charcoal-700 hover:!border-gold-300/40"
                    >
                      {hero.secondary_cta_text}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center mt-2 opacity-60">
                <div className="h-px w-8 bg-gold-300" />
                <div className="mx-1.5 w-1 h-1 rounded-full bg-gold-300" />
                <div className="h-px w-8 bg-gold-300" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
