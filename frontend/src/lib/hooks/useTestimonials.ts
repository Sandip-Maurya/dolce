import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../api/endpoints/content'

export const testimonialKeys = {
  all: ['testimonials'] as const,
  lists: () => [...testimonialKeys.all, 'list'] as const,
  text: () => [...testimonialKeys.lists(), 'text'] as const,
  video: () => [...testimonialKeys.lists(), 'video'] as const,
}

export function useTextTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.text(),
    queryFn: () => contentApi.fetchTextTestimonials(),
  })
}

export function useVideoTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.video(),
    queryFn: () => contentApi.fetchVideoTestimonials(),
  })
}

