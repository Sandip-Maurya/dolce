import Image from 'next/image'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { SectionWrapper } from '@/components/SectionWrapper'
import { ProductCard } from '@/components/ProductCard'
import { TextTestimonialCard } from '@/components/TextTestimonialCard'
import { VideoTestimonialCard } from '@/components/VideoTestimonialCard'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustBar } from '@/components/home/TrustBar'
import { BrandStorySection } from '@/components/home/BrandStorySection'
import { ShopByCategory } from '@/components/home/ShopByCategory'
import { SeasonalSection } from '@/components/home/SeasonalSection'
import { CorporateGiftingBand } from '@/components/home/CorporateGiftingBand'
import { FAQSection } from '@/components/home/FAQSection'
import { catalogApi } from '@/lib/api/endpoints/catalog'
import { contentApi } from '@/lib/api/endpoints/content'
import { SUSTAINABLE_GIFTING_DEFAULTS } from '@/lib/constants/images'

// Revalidate every 24 hours as fallback; on-demand revalidation handles immediate updates
// when content is changed in Django admin
export const revalidate = 86400

export default async function Home() {
  const [
    products,
    sustainableGiftingItems,
    textTestimonials,
    videoTestimonials,
    heroSection,
    trustBarItems,
    faqs,
    corporateGifting,
    seasonalSection,
    homepageCategories,
    allCategories,
    brandStorySection,
  ] = await Promise.all([
    catalogApi.fetchProducts().catch((e) => {
      console.error('Failed to fetch products', e)
      return []
    }),
    contentApi.fetchSustainableGiftingItems().catch((e) => {
      console.error('Failed to fetch sustainable items', e)
      return []
    }),
    contentApi.fetchTextTestimonials().catch((e) => {
      console.error('Failed to fetch text testimonials', e)
      return []
    }),
    contentApi.fetchVideoTestimonials().catch((e) => {
      console.error('Failed to fetch video testimonials', e)
      return []
    }),
    contentApi.fetchHeroSection(),
    contentApi.fetchTrustBarItems(),
    contentApi.fetchFAQs(),
    contentApi.fetchCorporateGifting(),
    contentApi.fetchSeasonalSection(),
    catalogApi.fetchHomepageCategories(),
    catalogApi.fetchCategoriesWithSubcategories().catch(() => []),
    contentApi.fetchBrandStorySection(),
  ])

  const featuredHampers =
    products?.filter(
      (p) =>
        p.category.slug === 'hamper' || p.category.name.toLowerCase() === 'hamper'
    ).slice(0, 3) ?? []

  const healthyIndulgences =
    products?.filter((p) =>
      p.tags.some(
        (tag) => tag.slug === 'sugar-free' || tag.slug === 'guilt-free'
      )
    ).slice(0, 3) ?? []

  return (
    <div className="flex flex-col">
      <HeroSection data={heroSection} />
      <TrustBar items={trustBarItems} />

      <SectionWrapper variant="muted" showBottomDivider dividerStyle="gold">
        <BrandStorySection data={brandStorySection} />
      </SectionWrapper>

      <SectionWrapper variant="default" showTopDivider showBottomDivider dividerStyle="border">
        <ShopByCategory
          categories={homepageCategories}
          allCategoriesFallback={allCategories}
        />
      </SectionWrapper>

      {featuredHampers.length > 0 && (
        <SectionWrapper variant="default" showBottomDivider dividerStyle="border">
          <Container>
            <SectionTitle
              title="Featured Hampers"
              subtitle="Curated collections of premium, sustainable treats"
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHampers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </SectionWrapper>
      )}

      {seasonalSection && (
        <SectionWrapper variant="muted" showTopDivider showBottomDivider dividerStyle="border">
          <SeasonalSection data={seasonalSection} products={products ?? []} />
        </SectionWrapper>
      )}

      {healthyIndulgences.length > 0 && (
        <SectionWrapper variant="muted" showBottomDivider dividerStyle="border">
          <Container>
            <SectionTitle
              title="Healthy Indulgences"
              subtitle="Sugar-free, organic, and guilt-free treats that delight"
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyIndulgences.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </SectionWrapper>
      )}

      <SectionWrapper variant="dark" showTopDivider showBottomDivider dividerStyle="gold">
        <CorporateGiftingBand data={corporateGifting} />
      </SectionWrapper>

      <SectionWrapper variant="default" showTopDivider showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle
            title="Sustainable Gifting"
            subtitle="Eco-friendly packaging that's as thoughtful as our treats"
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-12">
            {sustainableGiftingItems && sustainableGiftingItems.length > 0 ? (
              sustainableGiftingItems.map((item) => (
                <div key={item.id} className="space-y-6">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-beige-100">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-charcoal-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-charcoal-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              SUSTAINABLE_GIFTING_DEFAULTS.map((item, index) => (
                <div key={index} className="space-y-6">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-beige-100">
                    <Image
                      src={item.image_url}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-charcoal-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-charcoal-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="default" showTopDivider showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle
            title="What Our Customers Say"
            subtitle="Real stories from people who love Dolce Fiore"
            align="center"
          />
          {textTestimonials && textTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 mb-12">
              {textTestimonials.map((testimonial) => (
                <TextTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          )}
          {videoTestimonials && videoTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {videoTestimonials.map((testimonial) => (
                <VideoTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          )}
          {!textTestimonials?.length && !videoTestimonials?.length && (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Customer testimonials coming soon...</p>
            </div>
          )}
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="muted" showTopDivider dividerStyle="gold">
        <FAQSection items={faqs} />
      </SectionWrapper>
    </div>
  )
}
