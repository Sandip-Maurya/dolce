import { apiClient } from '../client'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  order: number
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  order: number
  category: Category
}

export interface SubcategoryNested {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  order: number
}

export interface CategoryWithSubcategories extends Category {
  subcategories: SubcategoryNested[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  currency: 'INR'
  category: Category
  subcategory: Subcategory
  images: string[]
  tags: Tag[]
  is_available: boolean
  weight_grams?: number
}

export interface ProductFilters {
  category?: string  // Category ID or slug
  subcategory?: string  // Subcategory ID or slug
  tag?: string  // Tag ID, slug, or comma-separated tags
  search?: string
  sort?: 'newest' | 'price_low' | 'price_high'
  [key: string]: string | number | boolean | undefined
}

export const catalogApi = {
  fetchProducts: (filters?: ProductFilters) => 
    apiClient.get<Product[]>('/products/', filters as Record<string, string | number | boolean | undefined>),
  fetchProduct: (slug: string) => apiClient.get<Product>(`/products/${slug}/`),
  fetchCategories: () => apiClient.get<Category[]>('/products/categories/'),
  fetchCategoriesWithSubcategories: () => 
    apiClient.get<CategoryWithSubcategories[]>('/products/categories/?include=subcategories'),
  fetchSubcategories: (categoryId: string) => 
    apiClient.get<Subcategory[]>(`/products/categories/${categoryId}/subcategories/`),
  fetchTags: () => apiClient.get<Tag[]>('/products/tags/'),
}

