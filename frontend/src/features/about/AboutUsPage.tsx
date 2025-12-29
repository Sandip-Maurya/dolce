import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { SkeletonText, SkeletonPhotoGallery, SkeletonBlogPost } from '../../components/SkeletonLoader'
import { useAboutUs, useOurStory, useOurCommitment, usePhotoGallery, useBlogs, useContactInfo } from '../../lib/hooks/useAboutUs'
import { useTextTestimonials, useVideoTestimonials } from '../../lib/hooks/useTestimonials'
import { TextTestimonialCard } from '../../components/TextTestimonialCard'
import { VideoTestimonialCard } from '../../components/VideoTestimonialCard'
import { ContactForm } from '../../components/ContactForm'

export function AboutUsPage() {
  const { data: aboutUs, isLoading: isLoadingAboutUs, isError: isErrorAboutUs } = useAboutUs()
  const { data: ourStory, isLoading: isLoadingOurStory, isError: isErrorOurStory } = useOurStory()
  const { data: ourCommitment, isLoading: isLoadingOurCommitment, isError: isErrorOurCommitment } = useOurCommitment()
  const { data: photoGallery, isLoading: isLoadingPhotoGallery, isError: isErrorPhotoGallery } = usePhotoGallery()
  const { data: blogs, isLoading: isLoadingBlogs, isError: isErrorBlogs } = useBlogs()
  const { data: textTestimonials, isLoading: isLoadingTextTestimonials } = useTextTestimonials()
  const { data: videoTestimonials, isLoading: isLoadingVideoTestimonials } = useVideoTestimonials()
  const { data: contactInfo, isLoading: isLoadingContactInfo, isError: isErrorContactInfo } = useContactInfo()

  // Default fallback content for About Us
  const defaultAboutUs = {
    title: 'About Us',
    content: (
      'At Dolce Fiore, we are passionate about creating premium, sustainable gift experiences '
      + 'that celebrate health, sustainability, and conscious living. Every product is designed '
      + 'to delight while leaving a positive impact on people and the planet. We believe that '
      + 'premium gifting can and should be kind to the planet, creating beautiful moments '
      + 'without leaving a heavy footprint.'
    ),
  }

  // Default fallback content for Our Story
  const defaultOurStory = {
    title: 'Our Story',
    content: (
      'Dolce Fiore began as a homegrown venture with a simple dream — to craft thoughtful, '
      + 'sustainable gifting experiences. What started four years ago with a passion for healthy '
      + 'indulgence has grown into a celebration of creativity and conscious living.\n\n'
      + 'We proudly partner with local artisans across India, bringing tradition and sustainability '
      + 'into every creation. Every hamper is handcrafted with care, featuring organic ingredients, '
      + 'air-fried savories, and sugar-free chocolates — all wrapped in eco-friendly, reusable packaging.'
    ),
  }

  // Get content with fallback
  const aboutUsContent = (isErrorAboutUs || !aboutUs) ? defaultAboutUs : aboutUs
  const ourStoryContent = (isErrorOurStory || !ourStory) ? defaultOurStory : ourStory

  // Default fallback content for Contact Info
  const defaultContactInfo = {
    id: null,
    email: 'hello@dolcefiore.com',
    phone: '+91 1234567890',
    response_message: 'We typically respond within 24-48 hours. For urgent matters, please call us directly.',
  }
  const contactInfoContent = (isErrorContactInfo || !contactInfo) ? defaultContactInfo : contactInfo

  return (
    <div className="flex flex-col">
      <Container>
        {/* About Us Section */}
        <div className="pt-12 sm:pt-16 pb-8 sm:pb-12">
          <SectionTitle
            title={aboutUsContent.title}
            align="center"
          />
          {isLoadingAboutUs ? (
            <div className="max-w-3xl mx-auto mt-8">
              <SkeletonText lines={5} className="mb-4" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8">
              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed whitespace-pre-line">
                {aboutUsContent.content}
              </p>
            </div>
          )}
        </div>

        {/* Our Story Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-beige-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={ourStoryContent.title}
            align="center"
          />
          {isLoadingOurStory ? (
            <div className="max-w-3xl mx-auto mt-8">
              <SkeletonText lines={6} className="mb-4" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8">
              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed whitespace-pre-line">
                {ourStoryContent.content}
              </p>
            </div>
          )}
        </div>

        {/* Our Commitment Section */}
        <div className="pt-8 sm:pt-12 pb-8 sm:pb-12">
          <SectionTitle
            title="Our Commitment"
            align="center"
          />
          {isLoadingOurCommitment ? (
            <div className="max-w-3xl mx-auto mt-8">
              <SkeletonText lines={4} className="mb-4" />
            </div>
          ) : isErrorOurCommitment || !ourCommitment || ourCommitment.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-8">
              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
                At Dolce Fiore, sustainability isn't an afterthought—it's woven into every 
                decision we make. We believe that premium gifting can and should be kind to 
                the planet, creating beautiful moments without leaving a heavy footprint.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8 space-y-6">
              {ourCommitment.map((section) => (
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
          {isLoadingPhotoGallery ? (
            <div className="mt-12">
              <SkeletonPhotoGallery count={6} />
            </div>
          ) : isErrorPhotoGallery || !photoGallery || photoGallery.length === 0 ? (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Photo gallery coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {photoGallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="aspect-square w-full overflow-hidden bg-beige-100">
                    <img
                      src={item.image_url}
                      alt={item.title || 'Gallery photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
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
          {isLoadingBlogs ? (
            <div className="mt-12">
              <SkeletonBlogPost count={3} />
            </div>
          ) : isErrorBlogs || !blogs || blogs.length === 0 ? (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Blog posts coming soon...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto mt-12 space-y-8">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover"
                >
                  {blog.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-beige-100">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
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
          {isLoadingTextTestimonials ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-beige-200 rounded w-24 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-beige-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-beige-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-beige-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                    <div className="pt-4 border-t border-beige-200 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-beige-200 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-beige-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-beige-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : textTestimonials && textTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {textTestimonials.map((testimonial) => (
                <TextTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : null}

          {/* Video Testimonials */}
          {isLoadingVideoTestimonials ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className="aspect-video w-full bg-beige-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-beige-200 rounded w-24 animate-pulse"></div>
                    <div className="pt-4 border-t border-beige-200 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-beige-200 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-beige-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-beige-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : videoTestimonials && videoTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {videoTestimonials.map((testimonial) => (
                <VideoTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : null}

          {/* Empty State */}
          {!isLoadingTextTestimonials && !isLoadingVideoTestimonials &&
           (!textTestimonials || textTestimonials.length === 0) &&
           (!videoTestimonials || videoTestimonials.length === 0) && (
            <div className="text-center text-charcoal-600 mt-12">
              <p>Customer testimonials coming soon...</p>
            </div>
          )}
        </div>

        {/* Contact Us Section */}
        <div className="pt-8 sm:pt-12 pb-12 sm:pb-16">
          <SectionTitle
            title="Get In Touch"
            subtitle="We'd love to hear from you"
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
              <h3 className="text-2xl font-heading text-charcoal-900 mb-6">
                Contact Information
              </h3>
              {isLoadingContactInfo ? (
                <div className="space-y-6">
                  <div className="h-16 bg-beige-100 rounded animate-pulse"></div>
                  <div className="h-16 bg-beige-100 rounded animate-pulse"></div>
                  <div className="h-12 bg-beige-100 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gold-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-500 mb-1">Email</h4>
                      <a
                        href={`mailto:${contactInfoContent.email}`}
                        className="text-base text-charcoal-900 hover:text-gold-600 transition-colors"
                      >
                        {contactInfoContent.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gold-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-500 mb-1">Phone</h4>
                      <a
                        href={`tel:${contactInfoContent.phone.replace(/\s+/g, '')}`}
                        className="text-base text-charcoal-900 hover:text-gold-600 transition-colors"
                      >
                        {contactInfoContent.phone}
                      </a>
                    </div>
                  </div>

                  {contactInfoContent.response_message && (
                    <div className="pt-4 border-t border-beige-200">
                      <p className="text-sm text-charcoal-600 leading-relaxed">
                        {contactInfoContent.response_message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

