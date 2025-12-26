import { type Cart, type CartItem } from '../../lib/api/endpoints/cart'
import { mockProducts } from './products'

// In-memory cart storage for MSW
let mockCart: Cart = {
  items: [],
  total: 0,
}

export function getMockCart(): Cart {
  return mockCart
}

export function addToMockCart(productId: string, quantity: number): CartItem {
  const product = mockProducts.find((p) => p.id === productId)
  if (!product) {
    throw new Error('Product not found')
  }

  // Check if item already exists in cart
  const existingItem = mockCart.items.find((item) => item.product.id === productId)
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity
    existingItem.line_total = existingItem.product.price * existingItem.quantity
  } else {
    // Add new item
    const newItem: CartItem = {
      id: `cart-item-${Date.now()}-${Math.random()}`,
      product,
      quantity,
      line_total: product.price * quantity,
    }
    mockCart.items.push(newItem)
  }

  // Recalculate total
  mockCart.total = mockCart.items.reduce((sum, item) => sum + item.line_total, 0)

  return existingItem || mockCart.items[mockCart.items.length - 1]
}

export function removeFromMockCart(itemId: string): void {
  mockCart.items = mockCart.items.filter((item) => item.id !== itemId)
  mockCart.total = mockCart.items.reduce((sum, item) => sum + item.line_total, 0)
}

export function updateMockCartQuantity(itemId: string, quantity: number): CartItem {
  const item = mockCart.items.find((item) => item.id === itemId)
  if (!item) {
    throw new Error('Cart item not found')
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  item.quantity = quantity
  item.line_total = item.product.price * quantity

  // Recalculate total
  mockCart.total = mockCart.items.reduce((sum, item) => sum + item.line_total, 0)

  return item
}

export function clearMockCart(): void {
  mockCart = {
    items: [],
    total: 0,
  }
}

