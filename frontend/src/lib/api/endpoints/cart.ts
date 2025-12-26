import { apiClient } from '../client'
import type { Product } from './catalog'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  line_total: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export const cartApi = {
  getCart: () => apiClient.get<Cart>('/cart/'),
  addToCart: (productId: string, quantity: number) =>
    apiClient.post<CartItem>('/cart/', { productId, quantity }),
  removeFromCart: (itemId: string) =>
    apiClient.delete(`/cart/${itemId}/delete/`),
  updateCartQuantity: (itemId: string, quantity: number) =>
    apiClient.put<CartItem>(`/cart/${itemId}/`, { quantity }),
}

