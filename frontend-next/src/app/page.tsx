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
        <BrandStorySection />
      </SectionWrapper>

      <SectionWrapper variant="default" showTopDivider showBottomDivider dividerStyle="border">
        <ShopByCategory
          categories={homepageCategories}
          allCategoriesFallback={allCategories}
        />
      </SectionWrapper>

      <SectionWrapper variant="default" showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle
            title="Featured Hampers"
            subtitle="Curated collections of premium, sustainable treats"
            align="center"
          />
          {featuredHampers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHampers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-charcoal-600 mb-12">
              Discover our handcrafted selection coming soon...
            </p>
          )}
        </Container>
      </SectionWrapper>

      {seasonalSection && (
        <SectionWrapper variant="muted" showTopDivider showBottomDivider dividerStyle="border">
          <SeasonalSection data={seasonalSection} products={products ?? []} />
        </SectionWrapper>
      )}

      <SectionWrapper variant="muted" showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle
            title="Healthy Indulgences"
            subtitle="Sugar-free, organic, and guilt-free treats that delight"
            align="center"
          />
          {healthyIndulgences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyIndulgences.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-charcoal-600 mb-12">
              Our curated selection coming soon...
            </p>
          )}
        </Container>
      </SectionWrapper>

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
              <>
                <div className="space-y-6">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-beige-100">
                    <Image
                      src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop"
                      alt="Eco-friendly kraft paper packaging"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-charcoal-900 mb-4">
                      Reusable Materials
                    </h3>
                    <p className="text-charcoal-700 leading-relaxed">
                      Every hamper is thoughtfully wrapped in reusable kraft
                      paper, jute bags, and glass containers. These materials
                      aren&apos;t just packaging—they&apos;re part of the gift,
                      designed to be used again and again in your home.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-beige-100">
                    <Image
                      src="https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80&auto=format&fit=crop"
                      alt="Wooden trays and natural materials"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-charcoal-900 mb-4">
                      Conscious Living
                    </h3>
                    <p className="text-charcoal-700 leading-relaxed">
                      We partner with local artisans who share our commitment to
                      sustainability. From wooden trays to cotton wraps, every
                      element is chosen for its minimal environmental impact and
                      maximum beauty.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="muted" showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle title="Our Commitment" align="center" />
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
              At Dolce Fiore, sustainability isn&apos;t an afterthought—it&apos;s
              woven into every decision we make. We believe that premium gifting
              can and should be kind to the planet, creating beautiful moments
              without leaving a heavy footprint.
            </p>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="muted" showBottomDivider dividerStyle="border">
        <Container>
          <SectionTitle title="Our Story" align="center" />
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed mb-12">
              Dolce Fiore began as a homegrown venture with a simple dream — to
              craft thoughtful, sustainable gifting experiences. What started
              four years ago with a passion for healthy indulgence has grown into
              a celebration of creativity and conscious living.
            </p>
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
              We proudly partner with local artisans across India, bringing
              tradition and sustainability into every creation. Every hamper is
              handcrafted with care, featuring organic ingredients, air-fried
              savories, and sugar-free chocolates — all wrapped in eco-friendly,
              reusable packaging.
            </p>
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
