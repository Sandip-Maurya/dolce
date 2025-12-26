import { type Order } from '../../lib/api/endpoints/orders'
import { type CartItem } from '../../lib/api/endpoints/cart'
import { mockProducts } from './products'

// In-memory orders storage for MSW
let mockOrders: Order[] = []

export function getMockOrders(): Order[] {
  return [...mockOrders]
}

export function createMockOrder(
  items: CartItem[],
  _customerDetails: {
    name: string
    email: string
    phone: string
  },
  _shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
): Order {
  const total = items.reduce((sum, item) => sum + item.line_total, 0)

  const newOrder: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: [...items],
    total,
    status: 'PLACED',
    created_at: new Date().toISOString(),
  }

  mockOrders.push(newOrder)
  return newOrder
}

// Helper to create a sample order for initial mock data
export function createSampleOrder(): Order {
  const sampleItems: CartItem[] = [
    {
      id: 'sample-item-1',
      product: mockProducts[0],
      quantity: 1,
      line_total: mockProducts[0].price,
    },
    {
      id: 'sample-item-2',
      product: mockProducts[2],
      quantity: 2,
      line_total: mockProducts[2].price * 2,
    },
  ]

  return createMockOrder(
    sampleItems,
    {
      name: 'Sample Customer',
      email: 'sample@example.com',
      phone: '+91 9876543210',
    },
    {
      street: '123 Sample Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    }
  )
}

