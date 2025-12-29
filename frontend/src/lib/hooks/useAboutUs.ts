import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../api/endpoints/content'

export const aboutUsKeys = {
  all: ['about-us'] as const,
  aboutUs: () => [...aboutUsKeys.all, 'about-us'] as const,
  ourStory: () => [...aboutUsKeys.all, 'our-story'] as const,
  ourCommitment: () => [...aboutUsKeys.all, 'our-commitment'] as const,
  photoGallery: () => [...aboutUsKeys.all, 'photo-gallery'] as const,
  blogs: () => [...aboutUsKeys.all, 'blogs'] as const,
  contactInfo: () => [...aboutUsKeys.all, 'contact-info'] as const,
  storeCenters: () => [...aboutUsKeys.all, 'store-centers'] as const,
}

export function useAboutUs() {
  return useQuery({
    queryKey: aboutUsKeys.aboutUs(),
    queryFn: () => contentApi.fetchAboutUs(),
  })
}

export function useOurStory() {
  return useQuery({
    queryKey: aboutUsKeys.ourStory(),
    queryFn: () => contentApi.fetchOurStory(),
  })
}

export function useOurCommitment() {
  return useQuery({
    queryKey: aboutUsKeys.ourCommitment(),
    queryFn: () => contentApi.fetchOurCommitment(),
  })
}

export function usePhotoGallery() {
  return useQuery({
    queryKey: aboutUsKeys.photoGallery(),
    queryFn: () => contentApi.fetchPhotoGallery(),
  })
}

export function useBlogs() {
  return useQuery({
    queryKey: aboutUsKeys.blogs(),
    queryFn: () => contentApi.fetchBlogs(),
  })
}

export function useContactInfo() {
  return useQuery({
    queryKey: aboutUsKeys.contactInfo(),
    queryFn: () => contentApi.fetchContactInfo(),
  })
}

export function useStoreCenters() {
  return useQuery({
    queryKey: aboutUsKeys.storeCenters(),
    queryFn: () => contentApi.fetchStoreCenters(),
  })
}

