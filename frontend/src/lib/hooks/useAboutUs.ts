import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../api/endpoints/content'

export const aboutUsKeys = {
  all: ['about-us'] as const,
  aboutUs: () => [...aboutUsKeys.all, 'about-us'] as const,
  ourStory: () => [...aboutUsKeys.all, 'our-story'] as const,
  ourCommitment: () => [...aboutUsKeys.all, 'our-commitment'] as const,
  photoGallery: () => [...aboutUsKeys.all, 'photo-gallery'] as const,
  blogs: () => [...aboutUsKeys.all, 'blogs'] as const,
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

