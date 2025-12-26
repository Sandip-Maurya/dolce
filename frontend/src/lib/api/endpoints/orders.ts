import { apiClient } from '../client'
import type { CartItem } from './cart'

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'PLACED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
  created_at: string
}

export const ordersApi = {
  getOrders: () => apiClient.get<Order[]>('/orders/'),
  placeOrder: (orderData: unknown) =>
    apiClient.post<Order>('/orders/', orderData),
}

