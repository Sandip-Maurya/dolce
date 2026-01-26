import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { SectionTitle } from '@/components/SectionTitle'
import { ProductCard } from '@/components/ProductCard'
import { TextTestimonialCard } from '@/components/TextTestimonialCard'
import { VideoTestimonialCard } from '@/components/VideoTestimonialCard'
import { catalogApi } from '@/lib/api/endpoints/catalog'
import { contentApi } from '@/lib/api/endpoints/content'

// Revalidate data every hour
export const revalidate = 3600

export default async function Home() {
  const [
    products,
    sustainableGiftingItems,
    textTestimonials,
    videoTestimonials
  ] = await Promise.all([
    catalogApi.fetchProducts().catch((e) => {
        console.error('Failed to fetch products', e);
        return [];
    }),
    contentApi.fetchSustainableGiftingItems().catch((e) => {
        console.error('Failed to fetch sustainable items', e);
        return [];
    }),
    contentApi.fetchTextTestimonials().catch((e) => {
        console.error('Failed to fetch text testimonials', e);
        return [];
    }),
    contentApi.fetchVideoTestimonials().catch((e) => {
        console.error('Failed to fetch video testimonials', e);
        return [];
    }),
  ])

  const featuredHampers = products?.filter((p) => 
    p.category.slug === 'hamper' || p.category.name.toLowerCase() === 'hamper'
  ).slice(0, 3) || []
  
  const healthyIndulgences = products?.filter((p) => 
    p.tags.some(tag => tag.slug === 'sugar-free' || tag.slug === 'guilt-free')
  ).slice(0, 3) || []

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] mb-0 flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1920&q=80&auto=format&fit=crop"
            alt="Premium artisanal gift hampers with organic treats"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/20 via-charcoal-900/40 to-charcoal-900/70"></div>
          <div className="absolute inset-0 hero-vignette"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent"></div>
        </div>

        <Container>
          <div className="relative py-8 sm:py-10 lg:py-12 xl:py-16 flex items-center justify-center text-center px-4 sm:px-6 w-full">
            <div className="max-w-4xl w-full animate-in fade-in duration-1000 ease-out relative z-10">
              {/* Decorative Top Accent Line */}
              <div className="flex items-center justify-center mt-0 sm:mt-3 lg:mt-4 xl:mt-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 opacity-60">
                <div className="h-px w-16 bg-gold-300"></div>
                <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gold-300"></div>
                <div className="h-px w-16 bg-gold-300"></div>
              </div>

              {/* Text Content */}
              <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-5 sm:p-6 lg:p-8 xl:p-10 border border-white/10 shadow-2xl">
                <h1 className="font-heading text-white mb-3 sm:mb-4 lg:mb-5 xl:mb-6 leading-tight tracking-normal sm:tracking-wide lg:tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                  Handcrafted, Sustainable, <span className="text-gold-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Guilt-Free Gifting</span>
                </h1>
                
                <div className="flex items-center justify-center my-3 sm:my-4 lg:my-5 xl:my-6">
                  <div className="h-px w-24 bg-gold-300/50"></div>
                </div>

                <p className="text-beige-50 mb-4 sm:mb-6 lg:mb-8 xl:mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] px-2 text-base sm:text-lg lg:text-xl">
                  Premium gift hampers featuring organic, guilt-free treats, air-fried
                  savories, and sugar-free chocolates — all wrapped in eco-friendly,
                  reusable packaging.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 justify-center items-center relative z-20">
                  <Link href="/products" className="w-full sm:w-auto group">
                    <Button 
                      variant="primary" 
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-charcoal-900 hover:bg-charcoal-800 border border-gold-300/20"
                    >
                      Explore Hampers
                    </Button>
                  </Link>
                  <Link href="/products" className="w-full sm:w-auto group">
                    <Button 
                      variant="secondary" 
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center mt-2 sm:mt-4 lg:mt-6 xl:mt-8 opacity-60">
                <div className="h-px w-12 bg-gold-300"></div>
                <div className="mx-2 w-1 h-1 rounded-full bg-gold-300"></div>
                <div className="h-px w-12 bg-gold-300"></div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Hampers */}
      <Container>
        <div className="pt-12 sm:pt-12 pb-4 sm:pb-4">
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
        </div>

        {/* Healthy Indulgences */}
        <div className="pt-12 sm:pt-12 pb-4 sm:pb-4 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
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
        </div>

        {/* Sustainable Gifting */}
        <div className="pt-12 sm:pt-12 pb-4 sm:pb-4">
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
              // Fallback content if API fails or is empty
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
                      Every hamper is thoughtfully wrapped in reusable kraft paper, jute bags, and 
                      glass containers. These materials aren&apos;t just packaging—they&apos;re part of the 
                      gift, designed to be used again and again in your home.
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
                      We partner with local artisans who share our commitment to sustainability. 
                      From wooden trays to cotton wraps, every element is chosen for its minimal 
                      environmental impact and maximum beauty.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-12 sm:pt-12 pb-4 sm:pb-4 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg sm:rounded-none">
          <SectionTitle
            title="Our Commitment"
            align="center"
          />
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
            At Dolce Fiore, sustainability isn&apos;t an afterthought—it&apos;s woven into every 
                decision we make. We believe that premium gifting can and should be kind to 
                the planet, creating beautiful moments without leaving a heavy footprint.
            </p>
          </div>
        </div>

        {/* Dolce Fiore Story */}
        <div className="pt-8 sm:pt-2 pb-12 sm:pb-12 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg sm:rounded-none">
          <SectionTitle
            title="Our Story"
            align="center"
          />
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed mb-12">
              Dolce Fiore began as a homegrown venture with a simple dream — to craft
              thoughtful, sustainable gifting experiences. What started four years ago with
              a passion for healthy indulgence has grown into a celebration of creativity
              and conscious living.
            </p>
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
              We proudly partner with local artisans across India, bringing tradition and
              sustainability into every creation. Every hamper is handcrafted with care,
              featuring organic ingredients, air-fried savories, and sugar-free chocolates —
              all wrapped in eco-friendly, reusable packaging.
            </p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="pt-12 sm:pt-16 pb-12 sm:pb-16">
          <SectionTitle
            title="What Our Customers Say"
            subtitle="Real stories from people who love Dolce Fiore"
            align="center"
          />

          {textTestimonials && textTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 mb-12">
              {textTestimonials.map((testimonial) => (
                <TextTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}

          {videoTestimonials && videoTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {videoTestimonials.map((testimonial) => (
                <VideoTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}

          {(!textTestimonials?.length && !videoTestimonials?.length) && (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Customer testimonials coming soon...</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
