import { apiClient } from '../client'

export interface SustainableGiftingItem {
  id: string
  title: string
  description: string
  image_url: string
  order: number
  is_active: boolean
}

export interface TextTestimonial {
  id: string
  name: string
  text: string
  rating: number
  location: string
  image_url: string
  order: number
}

export interface VideoTestimonial {
  id: string
  name: string
  text: string
  video_url: string
  rating: number
  location: string
  image_url: string
  order: number
}

export interface AboutUsSection {
  id: string | null
  title: string
  content: string
  order: number
  is_active: boolean
}

export interface OurStorySection {
  id: string | null
  title: string
  content: string
  order: number
  is_active: boolean
}

export interface OurCommitmentSection {
  id: string
  title: string
  content: string
  order: number
  is_active: boolean
}

export interface PhotoGalleryItem {
  id: string
  title: string
  image_url: string
  order: number
  is_active: boolean
}

export interface BlogPost {
  id: string
  title: string
  content: string
  image_url: string
  published_date: string
  order: number
  is_active: boolean
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: 'general' | 'product' | 'order' | 'partnership' | 'other'
  message: string
}

export interface ContactFormResponse {
  message: string
}

export interface StoreCenter {
  id: string
  name: string
  address: string
  google_map_link: string
  order: number
  is_active: boolean
}

export interface ContactInfo {
  id: string | null
  email: string
  phone: string
  additional_info: string
  opening_hours_monday: string
  opening_hours_tuesday: string
  opening_hours_wednesday: string
  opening_hours_thursday: string
  opening_hours_friday: string
  opening_hours_saturday: string
  opening_hours_sunday: string
}

export interface HeroSection {
  id: string
  headline: string
  highlight_text: string
  subheadline: string
  primary_cta_text: string
  primary_cta_link: string
  secondary_cta_text: string
  secondary_cta_link: string
  background_image_url: string
  is_active: boolean
}

export interface TrustBarItem {
  id: string
  icon_name: string
  text: string
  order: number
  is_active: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  is_active: boolean
}

export interface CorporateGiftingSection {
  id: string
  title: string
  description: string
  features: string[]
  primary_cta_text: string
  primary_cta_link: string
  secondary_cta_text: string
  secondary_cta_link: string
  background_image_url: string
  is_active: boolean
}

export interface SeasonalSection {
  id: string
  title: string
  subtitle: string
  start_date: string
  end_date: string
  badge_text: string
  cta_text: string
  cta_link: string
  background_color: string
  featured_product_ids: string[]
  is_active: boolean
}

export interface BrandStorySection {
  id: string
  title: string
  subtitle: string
  features: string[]
  cta_text: string
  cta_link: string
  is_active: boolean
}

export const contentApi = {
  fetchSustainableGiftingItems: () =>
    apiClient.get<SustainableGiftingItem[]>('/content/sustainable-gifting/'),
  fetchTextTestimonials: () =>
    apiClient.get<TextTestimonial[]>('/content/testimonials/text/'),
  fetchVideoTestimonials: () =>
    apiClient.get<VideoTestimonial[]>('/content/testimonials/video/'),
  fetchAboutUs: () =>
    apiClient.get<AboutUsSection>('/content/about-us/'),
  fetchOurStory: () =>
    apiClient.get<OurStorySection>('/content/our-story/'),
  fetchOurCommitment: () =>
    apiClient.get<OurCommitmentSection[]>('/content/our-commitment/'),
  fetchPhotoGallery: () =>
    apiClient.get<PhotoGalleryItem[]>('/content/photo-gallery/'),
  fetchBlogs: () =>
    apiClient.get<BlogPost[]>('/content/blogs/'),
  submitContactForm: (data: ContactFormData) =>
    apiClient.post<ContactFormResponse>('/content/contact/', data),
  fetchContactInfo: () =>
    apiClient.get<ContactInfo>('/content/contact-info/'),
  fetchStoreCenters: () =>
    apiClient.get<StoreCenter[]>('/content/store-centers/'),
  fetchHeroSection: () =>
    apiClient.get<HeroSection>('/content/hero/').catch((e) => {
      // Return null for any error (404, network timeout, etc.) - page will use defaults
      console.error('Failed to fetch hero section', e)
      return null
    }) as Promise<HeroSection | null>,
  fetchTrustBarItems: () =>
    apiClient.get<TrustBarItem[]>('/content/trust-bar/').catch((e) => {
      console.error('Failed to fetch trust bar items', e)
      return []
    }),
  fetchFAQs: () =>
    apiClient.get<FAQ[]>('/content/faqs/').catch((e) => {
      console.error('Failed to fetch FAQs', e)
      return []
    }),
  fetchCorporateGifting: () =>
    apiClient.get<CorporateGiftingSection>('/content/corporate-gifting/').catch((e) => {
      // Return null for any error (404, network timeout, etc.) - page will use defaults
      console.error('Failed to fetch corporate gifting', e)
      return null
    }) as Promise<CorporateGiftingSection | null>,
  fetchSeasonalSection: () =>
    apiClient.get<SeasonalSection>('/content/seasonal/').catch((e) => {
      // Return null for any error (404, network timeout, etc.) - page will use defaults
      console.error('Failed to fetch seasonal section', e)
      return null
    }) as Promise<SeasonalSection | null>,
  fetchBrandStorySection: () =>
    apiClient.get<BrandStorySection>('/content/brand-story/').catch((e) => {
      // Return null for any error (404, network timeout, etc.) - page will use defaults
      console.error('Failed to fetch brand story section', e)
      return null
    }) as Promise<BrandStorySection | null>,
}
