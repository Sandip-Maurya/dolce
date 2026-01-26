import { contentApi } from '@/lib/api/endpoints/content'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { TextTestimonialCard } from '@/components/TextTestimonialCard'
import { VideoTestimonialCard } from '@/components/VideoTestimonialCard'
import Image from 'next/image'
import type {
  AboutUsSection,
  OurStorySection,
  OurCommitmentSection,
  PhotoGalleryItem,
  BlogPost,
  TextTestimonial,
  VideoTestimonial,
} from '@/lib/api/endpoints/content'

export const revalidate = 3600

const defaultAboutUs: AboutUsSection = {
  id: null,
  title: 'About Us',
  content:
    'At Dolce Fiore, we are passionate about creating premium, sustainable gift experiences ' +
    'that celebrate health, sustainability, and conscious living. Every product is designed ' +
    'to delight while leaving a positive impact on people and the planet. We believe that ' +
    'premium gifting can and should be kind to the planet, creating beautiful moments ' +
    'without leaving a heavy footprint.',
  order: 0,
  is_active: true,
}

const defaultOurStory: OurStorySection = {
  id: null,
  title: 'Our Story',
  content:
    'Dolce Fiore began as a homegrown venture with a simple dream — to craft thoughtful, ' +
    'sustainable gifting experiences. What started four years ago with a passion for healthy ' +
    'indulgence has grown into a celebration of creativity and conscious living.\n\n' +
    'We proudly partner with local artisans across India, bringing tradition and sustainability ' +
    'into every creation. Every hamper is handcrafted with care, featuring organic ingredients, ' +
    'air-fried savories, and sugar-free chocolates — all wrapped in eco-friendly, reusable packaging.',
  order: 0,
  is_active: true,
}

const defaultCommitmentText =
  "At Dolce Fiore, sustainability isn't an afterthought—it's woven into every " +
  "decision we make. We believe that premium gifting can and should be kind to " +
  'the planet, creating beautiful moments without leaving a heavy footprint.'

export default async function AboutPage() {
  const [
    aboutUs,
    ourStory,
    ourCommitment,
    photoGallery,
    blogs,
    textTestimonials,
    videoTestimonials,
  ] = await Promise.all([
    contentApi.fetchAboutUs().catch(() => null),
    contentApi.fetchOurStory().catch(() => null),
    contentApi.fetchOurCommitment().catch(() => []),
    contentApi.fetchPhotoGallery().catch(() => []),
    contentApi.fetchBlogs().catch(() => []),
    contentApi.fetchTextTestimonials().catch(() => []),
    contentApi.fetchVideoTestimonials().catch(() => []),
  ])

  const aboutUsContent = aboutUs || defaultAboutUs
  const ourStoryContent = ourStory || defaultOurStory

  return (
    <div className="flex flex-col">
      <Container>
        {/* About Us Section */}
        <div className="pt-12 sm:pt-16 pb-8 sm:pb-12">
          <SectionTitle title={aboutUsContent.title} align="center" />
          <div className="max-w-3xl mx-auto mt-8">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed whitespace-pre-line">
              {aboutUsContent.content}
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle title={ourStoryContent.title} align="center" />
          <div className="max-w-3xl mx-auto mt-8">
            <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed whitespace-pre-line">
              {ourStoryContent.content}
            </p>
          </div>
        </div>

        {/* Our Commitment Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12">
          <SectionTitle title="Our Commitment" align="center" />
          {!ourCommitment || ourCommitment.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-8">
              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
                {defaultCommitmentText}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8 space-y-6">
              {ourCommitment.map((section: OurCommitmentSection) => (
                <div key={section.id}>
                  {section.title && (
                    <h3 className="text-xl sm:text-2xl font-heading text-charcoal-900 mb-3">
                      {section.title}
                    </h3>
                  )}
                  <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo Gallery Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Photo Gallery"
            subtitle="A glimpse into our world"
            align="center"
          />
          {!photoGallery || photoGallery.length === 0 ? (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Photo gallery coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {photoGallery.map((item: PhotoGalleryItem) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="aspect-square w-full overflow-hidden bg-beige-100 relative">
                    <Image
                      src={item.image_url}
                      alt={item.title || 'Gallery photo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {item.title && (
                    <div className="p-4">
                      <p className="text-sm text-charcoal-600 text-center">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blogs Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12">
          <SectionTitle
            title="Our Blog"
            subtitle="Stories, tips, and insights from Dolce Fiore"
            align="center"
          />
          {!blogs || blogs.length === 0 ? (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Blog posts coming soon...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto mt-12 space-y-8">
              {blogs.map((blog: BlogPost) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover"
                >
                  {blog.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-beige-100 relative">
                      <Image
                        src={blog.image_url}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 896px) 100vw, 896px"
                      />
                    </div>
                  )}
                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-heading text-charcoal-900 mb-3">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-charcoal-500 mb-4">
                      {new Date(blog.published_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-base text-charcoal-700 leading-relaxed whitespace-pre-line">
                      {blog.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        <div className="pt-8 sm:pt-12 pb-12 sm:pb-16 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="What Our Customers Say"
            subtitle="Real stories from people who love Dolce Fiore"
            align="center"
          />

          {/* Text Testimonials */}
          {textTestimonials && textTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {textTestimonials.map((testimonial: TextTestimonial) => (
                <TextTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}

          {/* Video Testimonials */}
          {videoTestimonials && videoTestimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {videoTestimonials.map((testimonial: VideoTestimonial) => (
                <VideoTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!textTestimonials || textTestimonials.length === 0) &&
            (!videoTestimonials || videoTestimonials.length === 0) && (
              <div className="text-center text-charcoal-600 mt-12">
                <p>Customer testimonials coming soon...</p>
              </div>
            )}
        </div>
      </Container>
    </div>
  )
}
