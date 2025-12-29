import { useMutation } from '@tanstack/react-query'
import { contentApi, type ContactFormData } from '../api/endpoints/content'

/**
 * Hook to submit contact form.
 */
export function useContactForm() {
  return useMutation({
    mutationFn: (data: ContactFormData) => contentApi.submitContactForm(data),
  })
}

