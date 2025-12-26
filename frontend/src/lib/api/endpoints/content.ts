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
}

