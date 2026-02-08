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
    <section className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] mb-0 flex items-center">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="Premium artisanal gift hampers with organic treats"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/20 via-charcoal-900/40 to-charcoal-900/70" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
      </div>

      <Container>
        <div className="relative py-8 sm:py-10 lg:py-12 xl:py-16 flex items-center justify-center text-center px-4 sm:px-6 w-full">
          <div className="max-w-4xl w-full animate-in fade-in duration-1000 ease-out relative z-10">
            <div className="flex items-center justify-center mt-0 sm:mt-3 lg:mt-4 xl:mt-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 opacity-60">
              <div className="h-px w-16 bg-gold-300" />
              <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gold-300" />
              <div className="h-px w-16 bg-gold-300" />
            </div>

            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-5 sm:p-6 lg:p-8 xl:p-10 border border-white/10 shadow-2xl">
              <h1 className="font-heading text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6 leading-tight tracking-normal sm:tracking-wide lg:tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                {hero.headline}{' '}
                <span className="text-gold-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  {hero.highlight_text}
                </span>
              </h1>

              <div className="flex items-center justify-center my-3 sm:my-4 lg:my-5 xl:my-6">
                <div className="h-px w-24 bg-gold-300/50" />
              </div>

              <p className="text-beige-50 mb-4 sm:mb-6 lg:mb-8 xl:mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] px-2 text-base sm:text-lg lg:text-xl">
                {hero.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 justify-center items-center relative z-20">
                <Link href={hero.primary_cta_link} className="w-full sm:w-auto group">
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-charcoal-900 hover:bg-charcoal-800 border border-gold-300/20"
                  >
                    {hero.primary_cta_text}
                  </Button>
                </Link>
                <Link href={hero.secondary_cta_link} className="w-full sm:w-auto group">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {hero.secondary_cta_text}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center mt-2 sm:mt-4 lg:mt-6 xl:mt-8 opacity-60">
              <div className="h-px w-12 bg-gold-300" />
              <div className="mx-2 w-1 h-1 rounded-full bg-gold-300" />
              <div className="h-px w-12 bg-gold-300" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
