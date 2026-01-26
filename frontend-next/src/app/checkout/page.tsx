'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { Button } from '@/components/Button'
import { PaymentSection } from '@/components/PaymentSection'
import { useCart } from '@/lib/hooks/useCart'
import { usePlaceOrder, type PlaceOrderData } from '@/lib/hooks/useOrders'
import { useUser, useProfile, useUpdateProfile } from '@/lib/hooks/useAuth'
import type { UpdateProfileData } from '@/lib/api/endpoints/auth'

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const router = useRouter()
  const { data: cart, isLoading: cartLoading } = useCart()
  const placeOrderMutation = usePlaceOrder()
  const { data: user } = useUser()
  const { data: profile } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [orderForSomeoneElse, setOrderForSomeoneElse] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [saveToProfile, setSaveToProfile] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [createdOrderTotal, setCreatedOrderTotal] = useState<number | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  })
  const [deliveryPreferences, setDeliveryPreferences] = useState({
    giftNote: '',
    deliveryDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (paymentCompleted && createdOrderId) {
      const timer = setTimeout(() => {
        router.replace(`/checkout/confirmation/${createdOrderId}`)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [paymentCompleted, createdOrderId, router])

  useEffect(() => {
    if (user && profile && !orderForSomeoneElse && !isEditingProfile) {
      setCustomerDetails({
        name: profile.name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
      })
      if (profile.shippingAddress) {
        setShippingAddress({
          street: profile.shippingAddress.street || '',
          city: profile.shippingAddress.city || '',
          state: profile.shippingAddress.state || '',
          zipCode: profile.shippingAddress.zipCode || '',
          country: profile.shippingAddress.country || 'India',
        })
      }
    }
  }, [user, profile, orderForSomeoneElse, isEditingProfile])

  const validateStep1 = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {}
    if (!customerDetails.name.trim()) newErrors.name = 'Name is required'
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[0-9]{10}$/.test(customerDetails.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)'
    }
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required'
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required'
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required'
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^[0-9]{6}$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code (6 digits required)'
    }
    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const validation = validateStep1()
      if (!validation.isValid) {
        if (user && profile && !orderForSomeoneElse && !isEditingProfile) {
          const labels: Record<string, string> = {
            name: 'Name', email: 'Email', phone: 'Phone',
            street: 'Street Address', city: 'City', state: 'State', zipCode: 'ZIP Code',
          }
          const missing = Object.keys(validation.errors).map((f) => labels[f] || f)
          toast.error(`Please complete your profile. Missing: ${missing.join(', ')}. Click "Edit" to update.`, { duration: 5000 })
        } else {
          const first = Object.values(validation.errors)[0]
          if (first) toast.error(`Please fix: ${first}`, { duration: 4000 })
        }
        return
      }
      const shouldSaveProfile = isEditingProfile || (orderForSomeoneElse && saveToProfile && user)
      if (shouldSaveProfile) {
        const updateData: UpdateProfileData = {
          phone: isEditingProfile ? (customerDetails.phone || undefined) : undefined,
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
          },
        }
        updateProfileMutation.mutate(updateData, {
          onSuccess: () => {
            if (isEditingProfile) {
              setIsEditingProfile(false)
              toast.success('Profile updated successfully')
            } else toast.success('Shipping address saved to profile')
            setCurrentStep(2)
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Failed to save profile')
            if (isEditingProfile) setIsEditingProfile(false)
            setCurrentStep(2)
          },
        })
      } else {
        if (isEditingProfile) setIsEditingProfile(false)
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (!cart || cart.items.length === 0) return
      const orderData: PlaceOrderData = {
        items: cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        customerDetails,
        shippingAddress: { ...shippingAddress, zipCode: shippingAddress.zipCode },
        deliveryPreferences: {
          giftNote: deliveryPreferences.giftNote || undefined,
          deliveryDate: deliveryPreferences.deliveryDate || undefined,
        },
      }
      placeOrderMutation.mutate(orderData, {
        onSuccess: (order) => {
          setCreatedOrderId(order.id)
          setCreatedOrderTotal(order.total)
          setCurrentStep(3)
        },
        onError: () => {
          toast.error('Failed to create order. Please try again.')
        },
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step)
  }

  const handlePaymentSuccess = () => setPaymentCompleted(true)
  const handlePaymentFailure = () => toast.error('Payment failed. Please try again.')

  const resetToProfile = () => {
    if (user && profile) {
      setCustomerDetails({
        name: profile.name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
      })
      if (profile.shippingAddress) {
        setShippingAddress({
          street: profile.shippingAddress.street || '',
          city: profile.shippingAddress.city || '',
          state: profile.shippingAddress.state || '',
          zipCode: profile.shippingAddress.zipCode || '',
          country: profile.shippingAddress.country || 'India',
        })
      }
      setErrors({})
    }
  }

  if (cartLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-charcoal-600">Loading checkout...</div>
        </div>
      </Container>
    )
  }

  if (paymentCompleted && createdOrderId) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-pulse">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading text-charcoal-900 mb-2">Payment Successful!</h2>
            <p className="text-charcoal-600 mb-4">Redirecting to order confirmation...</p>
          </div>
        </div>
      </Container>
    )
  }

  if ((!cart || cart.items.length === 0) && !createdOrderId) {
    return (
      <Container>
        <div className="py-12">
          <SectionTitle title="Checkout" align="center" />
          <div className="text-center py-12">
            <p className="text-charcoal-600 mb-6">Your cart is empty</p>
            <Button variant="primary" onClick={() => router.push('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  const showForm = !user || !profile || orderForSomeoneElse || isEditingProfile

  return (
    <Container>
      <div className="py-12">
        <SectionTitle title="Checkout" align="center" />
        <div className="flex items-center justify-center mb-8 mt-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step ? 'bg-charcoal-900 border-charcoal-900 text-beige-50' : 'bg-white border-beige-300 text-charcoal-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className={`w-16 sm:w-24 h-0.5 ${currentStep > step ? 'bg-charcoal-900' : 'bg-beige-300'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 sm:gap-8 mb-8 text-sm text-charcoal-600">
          <span className={currentStep === 1 ? 'font-medium text-charcoal-900' : ''}>Details</span>
          <span className={currentStep === 2 ? 'font-medium text-charcoal-900' : ''}>Delivery</span>
          <span className={currentStep === 3 ? 'font-medium text-charcoal-900' : ''}>Payment</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-heading text-charcoal-900">Customer Details & Address</h2>
                  {isEditingProfile && (
                    <button type="button" onClick={() => { setIsEditingProfile(false); resetToProfile() }} className="text-sm text-charcoal-600 hover:text-charcoal-900 underline">
                      Cancel Editing
                    </button>
                  )}
                </div>
                {isEditingProfile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-900">
                      <strong>Editing mode:</strong> Changes will be saved to your profile when you continue.
                    </p>
                  </div>
                )}

                {user && profile && (
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderForSomeoneElse}
                        onChange={(e) => {
                          setOrderForSomeoneElse(e.target.checked)
                          setIsEditingProfile(false)
                          if (!e.target.checked && profile) {
                            setCustomerDetails({ name: profile.name || '', email: profile.email || user.email || '', phone: profile.phone || '' })
                            if (profile.shippingAddress) {
                              setShippingAddress({
                                street: profile.shippingAddress.street || '',
                                city: profile.shippingAddress.city || '',
                                state: profile.shippingAddress.state || '',
                                zipCode: profile.shippingAddress.zipCode || '',
                                country: profile.shippingAddress.country || 'India',
                              })
                            }
                            setErrors({})
                          }
                        }}
                        className="w-5 h-5 text-charcoal-900 border-beige-300 rounded focus:ring-2 focus:ring-charcoal-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-charcoal-900">Order for someone else</span>
                        <p className="text-xs text-charcoal-600 mt-1">
                          {orderForSomeoneElse ? 'Enter recipient details below' : 'Using your profile information'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {user && profile && !orderForSomeoneElse && !isEditingProfile && (
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal-900 mb-2">Using your profile information</p>
                        {Object.keys(errors).length > 0 && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-900 mb-2">Please complete:</p>
                            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                              {errors.name && <li>{errors.name}</li>}
                              {errors.email && <li>{errors.email}</li>}
                              {errors.phone && <li>{errors.phone}</li>}
                              {errors.street && <li>{errors.street}</li>}
                              {errors.city && <li>{errors.city}</li>}
                              {errors.state && <li>{errors.state}</li>}
                              {errors.zipCode && <li>{errors.zipCode}</li>}
                            </ul>
                          </div>
                        )}
                        <div className="text-sm text-charcoal-700 space-y-1">
                          <p><span className="font-medium">Name:</span> {customerDetails.name || <span className="text-red-600">(Missing)</span>}</p>
                          <p><span className="font-medium">Email:</span> {customerDetails.email || <span className="text-red-600">(Missing)</span>}</p>
                          <p><span className="font-medium">Phone:</span> {customerDetails.phone || <span className="text-red-600">(Missing)</span>}</p>
                          {shippingAddress.street ? (
                            <div className="mt-2 pt-2 border-t border-beige-300">
                              <p className="font-medium mb-1">Shipping:</p>
                              <p className="text-charcoal-600">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}, {shippingAddress.country}</p>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-beige-300">
                              <p className="font-medium mb-1">Shipping:</p>
                              <p className="text-red-600">(Missing)</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setIsEditingProfile(true); setOrderForSomeoneElse(false) }} className="text-sm text-charcoal-600 hover:text-charcoal-900 underline">Edit</button>
                        <button type="button" onClick={() => { setOrderForSomeoneElse(true); setIsEditingProfile(false) }} className="text-sm text-charcoal-600 hover:text-charcoal-900 underline">Order for Someone Else</button>
                      </div>
                    </div>
                  </div>
                )}

                {showForm && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">Email *</label>
                      <input
                        id="email"
                        type="email"
                        value={customerDetails.email}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                        disabled={user && !orderForSomeoneElse && !isEditingProfile}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500 ${user && !orderForSomeoneElse && !isEditingProfile ? 'bg-beige-50 cursor-not-allowed' : ''}`}
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-2">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    <div className="border-t border-beige-200 pt-6 mt-6">
                      <h3 className="text-lg font-heading text-charcoal-900 mb-4">Shipping Address</h3>
                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-charcoal-700 mb-2">Street Address *</label>
                        <input
                          id="street"
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${errors.street ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                        />
                        {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-charcoal-700 mb-2">City *</label>
                          <input id="city" type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${errors.city ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`} />
                          {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-charcoal-700 mb-2">State *</label>
                          <input id="state" type="text" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${errors.state ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`} />
                          {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-charcoal-700 mb-2">ZIP Code *</label>
                          <input id="zipCode" type="text" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className={`w-full px-4 py-2 rounded-lg border ${errors.zipCode ? 'border-red-500' : 'border-beige-300'} focus:outline-none focus:ring-2 focus:ring-charcoal-500`} />
                          {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-charcoal-700 mb-2">Country *</label>
                          <input id="country" type="text" value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {orderForSomeoneElse && user && (
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} className="w-5 h-5 text-charcoal-900 border-beige-300 rounded focus:ring-2 focus:ring-charcoal-500" />
                      <div>
                        <span className="text-sm font-medium text-charcoal-900">Save this shipping address to my profile</span>
                        <p className="text-xs text-charcoal-600 mt-1">Recipient&apos;s address will be saved for future orders.</p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={() => router.push('/cart')}>
                    Back to Cart
                  </Button>
                  <Button variant="primary" onClick={handleNext} isLoading={updateProfileMutation.isPending} disabled={updateProfileMutation.isPending}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-charcoal-900 mb-6">Delivery Preferences & Gift Note</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-charcoal-700 mb-2">Preferred Delivery Date (Optional)</label>
                    <input
                      id="deliveryDate"
                      type="date"
                      value={deliveryPreferences.deliveryDate}
                      onChange={(e) => setDeliveryPreferences({ ...deliveryPreferences, deliveryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="giftNote" className="block text-sm font-medium text-charcoal-700 mb-2">Gift Message (Optional)</label>
                    <textarea
                      id="giftNote"
                      rows={4}
                      value={deliveryPreferences.giftNote}
                      onChange={(e) => setDeliveryPreferences({ ...deliveryPreferences, giftNote: e.target.value })}
                      placeholder="Add a personal message for the recipient..."
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={handleBack}>Back</Button>
                  <Button variant="primary" onClick={handleNext} isLoading={placeOrderMutation.isPending} disabled={placeOrderMutation.isPending}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-charcoal-900 mb-6">Payment Summary</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-heading text-charcoal-900 mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-4">
                      {cart?.items && cart.items.length > 0 ? (
                        cart.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-charcoal-700">{item.product.name} × {item.quantity}</span>
                            <span className="text-charcoal-900 font-medium">₹{item.line_total.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-charcoal-600">Order #{createdOrderId} - Please complete payment</div>
                      )}
                    </div>
                    <div className="border-t border-beige-200 pt-4 space-y-2">
                      <div className="flex justify-between text-charcoal-700"><span>Subtotal</span><span>₹{(createdOrderTotal ?? cart?.total ?? 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-charcoal-700"><span>Shipping</span><span>Calculated at delivery</span></div>
                      <div className="border-t border-beige-200 pt-2 flex justify-between text-xl font-heading text-charcoal-900"><span>Total</span><span>₹{(createdOrderTotal ?? cart?.total ?? 0).toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div>
                    {createdOrderId && createdOrderTotal !== null ? (
                      <PaymentSection amount={createdOrderTotal} currency="INR" orderId={createdOrderId} onPaymentSuccess={handlePaymentSuccess} onPaymentFailure={handlePaymentFailure} />
                    ) : (
                      <div className="text-sm text-charcoal-600">Preparing payment...</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={handleBack}>Back</Button>
                  <div className="text-sm text-charcoal-600 flex items-center">Complete payment to place your order</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
