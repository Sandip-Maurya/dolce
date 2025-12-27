import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/endpoints/catalog'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  withSubcategories: () => [...categoryKeys.all, 'with-subcategories'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => catalogApi.fetchCategories(),
  })
}

export function useCategoriesWithSubcategories() {
  return useQuery({
    queryKey: categoryKeys.withSubcategories(),
    queryFn: () => catalogApi.fetchCategoriesWithSubcategories(),
  })
}

