import { apiClient } from '../client'

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  currency: 'INR'
  category: 'COOKIE' | 'SNACK' | 'CAKE' | 'SWEET' | 'HAMPER'
  images: string[]
  tags: string[]
  is_available: boolean
  weight_grams?: number
}

export interface ProductFilters {
  category?: 'COOKIE' | 'SNACK' | 'CAKE' | 'SWEET' | 'HAMPER'
  tag?: string
  search?: string
  sort?: 'newest' | 'price_low' | 'price_high'
  [key: string]: string | number | boolean | undefined
}

export const catalogApi = {
  fetchProducts: (filters?: ProductFilters) => 
    apiClient.get<Product[]>('/products/', filters as Record<string, string | number | boolean | undefined>),
  fetchProduct: (slug: string) => apiClient.get<Product>(`/products/${slug}/`),
}

