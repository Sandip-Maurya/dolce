import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../api/endpoints/content'

export const sustainableGiftingKeys = {
  all: ['sustainable-gifting'] as const,
  lists: () => [...sustainableGiftingKeys.all, 'list'] as const,
  list: () => [...sustainableGiftingKeys.lists()] as const,
}

export function useSustainableGifting() {
  return useQuery({
    queryKey: sustainableGiftingKeys.list(),
    queryFn: () => contentApi.fetchSustainableGiftingItems(),
  })
}

