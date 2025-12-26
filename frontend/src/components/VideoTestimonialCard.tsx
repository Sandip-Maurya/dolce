import type { VideoTestimonial } from '../lib/api/endpoints/content'

interface VideoTestimonialCardProps {
  testimonial: VideoTestimonial
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-gold-500 fill-current' : 'text-beige-300'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/**
 * Converts YouTube/Vimeo URLs to embed format if needed
 */
function getEmbedUrl(url: string): string {
  // If already an embed URL, return as is
  if (url.includes('/embed/')) {
    return url
  }

  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo URL patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // If no match, return original URL (might be direct embed URL)
  return url
}

export function VideoTestimonialCard({ testimonial }: VideoTestimonialCardProps) {
  const embedUrl = getEmbedUrl(testimonial.video_url)

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full flex flex-col">
      {/* Video Embed */}
      <div className="aspect-video w-full overflow-hidden bg-charcoal-900">
        <iframe
          src={embedUrl}
          title={`Video testimonial from ${testimonial.name}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>

        {/* Optional Text */}
        {testimonial.text && (
          <div className="flex-grow mb-4">
            <p className="text-charcoal-700 leading-relaxed italic">
              "{testimonial.text}"
            </p>
          </div>
        )}

        {/* Customer Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-beige-200">
          {testimonial.image_url ? (
            <div className="flex-shrink-0">
              <img
                src={testimonial.image_url}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-beige-200"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-beige-100 flex items-center justify-center border-2 border-beige-200">
              <span className="text-charcoal-600 font-heading text-lg">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-grow min-w-0">
            <h4 className="text-base font-heading text-charcoal-900 mb-1">
              {testimonial.name}
            </h4>
            {testimonial.location && (
              <p className="text-sm text-charcoal-600 truncate">
                {testimonial.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

