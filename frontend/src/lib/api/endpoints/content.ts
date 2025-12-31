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
}

