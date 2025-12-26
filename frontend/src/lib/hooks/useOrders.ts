import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/endpoints/orders'
import { cartKeys } from './useCart'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
}

export interface PlaceOrderData {
  items: Array<{
    productId: string
    quantity: number
  }>
  customerDetails: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  deliveryPreferences?: {
    giftNote?: string
    deliveryDate?: string
  }
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => ordersApi.getOrders(),
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderData: PlaceOrderData) => ordersApi.placeOrder(orderData),
    onSuccess: () => {
      // Invalidate orders to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      // Clear cart after successful order
      queryClient.invalidateQueries({ queryKey: cartKeys.current() })
    },
  })
}

