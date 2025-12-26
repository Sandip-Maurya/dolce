import { http, HttpResponse } from 'msw'
import { mockProducts } from './data/products'
import { getMockCart, addToMockCart, removeFromMockCart, clearMockCart, updateMockCartQuantity } from './data/cart'
import { getMockOrders, createMockOrder } from './data/orders'
import { getMockProfile, updateMockProfile } from './data/profile'
import { type Profile } from '../lib/api/endpoints/auth'

export const handlers = [
  // Products endpoints
  http.get('/api/products', () => {
    return HttpResponse.json(mockProducts)
  }),

  http.get('/api/products/:slug', ({ params }) => {
    const { slug } = params
    const product = mockProducts.find((p) => p.slug === slug)
    
    if (!product) {
      return HttpResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(product)
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    const cart = getMockCart()
    return HttpResponse.json(cart)
  }),

  http.post('/api/cart', async ({ request }) => {
    const body = await request.json() as { productId: string; quantity: number }
    const { productId, quantity } = body

    if (!productId || !quantity || quantity <= 0) {
      return HttpResponse.json(
        { error: 'Invalid request. productId and quantity (positive number) are required.' },
        { status: 400 }
      )
    }

    try {
      const cartItem = addToMockCart(productId, quantity)
      return HttpResponse.json(cartItem, { status: 201 })
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to add item to cart' },
        { status: 404 }
      )
    }
  }),

  http.delete('/api/cart/:id', ({ params }) => {
    const { id } = params
    removeFromMockCart(id as string)
    return HttpResponse.json({ success: true })
  }),

  http.put('/api/cart/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as { quantity: number }
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return HttpResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    try {
      const cartItem = updateMockCartQuantity(id as string, quantity)
      return HttpResponse.json(cartItem)
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update cart item' },
        { status: 404 }
      )
    }
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    const orders = getMockOrders()
    return HttpResponse.json(orders)
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as {
      items: Array<{ productId: string; quantity: number }>
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

    const { items, customerDetails, shippingAddress } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return HttpResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!customerDetails || !shippingAddress) {
      return HttpResponse.json(
        { error: 'Customer details and shipping address are required' },
        { status: 400 }
      )
    }

    // Convert items to CartItem format
    const cartItems = items.map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId)
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`)
      }
      return {
        id: `cart-item-${Date.now()}-${Math.random()}`,
        product,
        quantity: item.quantity,
        line_total: product.price * item.quantity,
      }
    })

    try {
      const order = createMockOrder(cartItems, customerDetails, shippingAddress)
      // Clear cart after order is placed
      clearMockCart()
      return HttpResponse.json(order, { status: 201 })
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create order' },
        { status: 400 }
      )
    }
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    const { email, password } = body

    // Mock authentication - accept any email/password for development
    if (!email || !password) {
      return HttpResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Store user in localStorage for profile access
    try {
      localStorage.setItem('mock_user', JSON.stringify({ email, id: 'user-1' }))
    } catch {
      // Ignore localStorage errors
    }

    // Return mock user
    return HttpResponse.json({
      id: 'user-1',
      email,
      name: email.split('@')[0] || 'User',
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name: string }
    const { email, password, name } = body

    if (!email || !password || !name) {
      return HttpResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Store user in localStorage for profile access
    const userId = `user-${Date.now()}`
    try {
      localStorage.setItem('mock_user', JSON.stringify({ email, id: userId }))
    } catch {
      // Ignore localStorage errors
    }

    // Return mock user
    return HttpResponse.json({
      id: userId,
      email,
      name,
    }, { status: 201 })
  }),

  // Profile endpoints
  http.get('/api/auth/profile', () => {
    // For mock purposes, we'll use a default email
    // In a real app, this would come from the authenticated session
    // For now, we'll try to get it from localStorage or use a default
    let userEmail = 'sandip@example.com'
    try {
      const userData = localStorage.getItem('mock_user')
      if (userData) {
        const user = JSON.parse(userData)
        userEmail = user.email || userEmail
      }
    } catch {
      // Use default
    }

    const profile = getMockProfile(userEmail)
    if (!profile) {
      return HttpResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(profile)
  }),

  http.put('/api/auth/profile', async ({ request }) => {
    const body = await request.json() as {
      name?: string
      phone?: string
      shippingAddress?: {
        street?: string
        city?: string
        state?: string
        zipCode?: string
        country?: string
      }
    }

    // Get user email from localStorage or use default
    let userEmail = 'sandip@example.com'
    try {
      const userData = localStorage.getItem('mock_user')
      if (userData) {
        const user = JSON.parse(userData)
        userEmail = user.email || userEmail
      }
    } catch {
      // Use default
    }

    try {
      // Cast to Partial<Profile> to handle partial shippingAddress updates
      const updatedProfile = updateMockProfile(userEmail, body as Partial<Profile>)
      return HttpResponse.json(updatedProfile)
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update profile' },
        { status: 400 }
      )
    }
  }),

  // Payments endpoint
  http.post('/api/payments/create-order', async ({ request }) => {
    const body = await request.json() as { amount: number; currency: string; orderId?: string }
    const { amount, currency } = body

    if (!amount || amount <= 0) {
      return HttpResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Return mock payment order response
    return HttpResponse.json({
      paymentOrderId: `payment-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: 'RAZORPAY' as const,
      amount,
      currency: currency || 'INR',
    }, { status: 201 })
  }),
]

