/**
 * Centralized fallback images for the application.
 * These are used when CMS content is not available.
 * 
 * NOTE: Replace these Unsplash URLs with actual brand images
 * stored in your CDN/S3 bucket before production.
 */

export const FALLBACK_IMAGES = {
  // Hero section background
  hero: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1920&q=80&auto=format&fit=crop',
  
  // Sustainable Gifting section - should show eco-friendly packaging
  sustainableMaterials: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
  consciousLiving: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&q=80&auto=format&fit=crop',
  
  // Default category image - should show gift hamper
  category: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80&auto=format&fit=crop',
  
  // Product placeholder
  product: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80&auto=format&fit=crop',
  
  // Testimonial avatar placeholder
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&auto=format&fit=crop',
} as const

/**
 * Default content for Sustainable Gifting section when no CMS data exists
 */
export const SUSTAINABLE_GIFTING_DEFAULTS = [
  {
    title: 'Reusable Materials',
    description:
      "Every hamper is thoughtfully wrapped in reusable kraft paper, jute bags, and glass containers. These materials aren't just packaging—they're part of the gift, designed to be used again and again in your home.",
    image_url: FALLBACK_IMAGES.sustainableMaterials,
    alt: 'Eco-friendly kraft paper and jute packaging',
  },
  {
    title: 'Conscious Living',
    description:
      'We partner with local artisans who share our commitment to sustainability. From wooden trays to cotton wraps, every element is chosen for its minimal environmental impact and maximum beauty.',
    image_url: FALLBACK_IMAGES.consciousLiving,
    alt: 'Wooden trays and natural materials',
  },
] as const
