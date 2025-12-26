import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { useCart } from '../../lib/hooks/useCart'
import { usePlaceOrder, type PlaceOrderData } from '../../lib/hooks/useOrders'
import { useUser, useProfile } from '../../lib/hooks/useAuth'
import { PaymentSection } from './PaymentSection'

type Step = 1 | 2 | 3

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading: cartLoading } = useCart()
  const placeOrderMutation = usePlaceOrder()
  const { data: user } = useUser()
  const { data: profile } = useProfile()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [orderForSomeoneElse, setOrderForSomeoneElse] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  // Form state
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

  // Navigate to confirmation when order is created and cart is cleared
  useEffect(() => {
    if (createdOrderId && (!cart || cart.items.length === 0)) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        navigate(`/checkout/confirmation/${createdOrderId}`, { replace: true })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [createdOrderId, cart, navigate])

  // Pre-fill from profile when user is logged in and profile is loaded
  useEffect(() => {
    if (user && profile && !orderForSomeoneElse) {
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
  }, [user, profile, orderForSomeoneElse])

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required'
    }
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
    if (!shippingAddress.street.trim()) {
      newErrors.street = 'Street address is required'
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^[0-9]{6}$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code (6 digits required)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      // Create order before moving to payment step
      if (!cart || cart.items.length === 0) {
        return
      }

      const orderData: PlaceOrderData = {
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerDetails,
        shippingAddress: {
          ...shippingAddress,
          zipCode: shippingAddress.zipCode,
        },
        deliveryPreferences: {
          giftNote: deliveryPreferences.giftNote || undefined,
          deliveryDate: deliveryPreferences.deliveryDate || undefined,
        },
      }

      placeOrderMutation.mutate(orderData, {
        onSuccess: (order) => {
          setCreatedOrderId(order.id)
          setCurrentStep(3)
        },
        onError: (error) => {
          console.error('Failed to create order:', error)
          alert('Failed to create order. Please try again.')
        },
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handlePlaceOrder = () => {
    // Order is already created in step 2, just navigate to confirmation
    if (createdOrderId) {
      navigate(`/checkout/confirmation/${createdOrderId}`)
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

  // If order is created and cart is empty, show redirecting state
  if (createdOrderId && (!cart || cart.items.length === 0)) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-heading text-charcoal-900 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-charcoal-600 mb-4">Redirecting to order confirmation...</p>
          </div>
        </div>
      </Container>
    )
  }

  // If cart is empty and no order created, show empty cart message
  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <div className="py-12">
          <SectionTitle title="Checkout" align="center" />
          <div className="text-center py-12">
            <p className="text-charcoal-600 mb-6">Your cart is empty</p>
            <Button variant="primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-12">
        <SectionTitle title="Checkout" align="center" />

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 mt-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-charcoal-900 border-charcoal-900 text-beige-50'
                    : 'bg-white border-beige-300 text-charcoal-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 ${
                    currentStep > step ? 'bg-charcoal-900' : 'bg-beige-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 sm:gap-8 mb-8 text-sm text-charcoal-600">
          <span className={currentStep === 1 ? 'font-medium text-charcoal-900' : ''}>
            Details
          </span>
          <span className={currentStep === 2 ? 'font-medium text-charcoal-900' : ''}>
            Delivery
          </span>
          <span className={currentStep === 3 ? 'font-medium text-charcoal-900' : ''}>
            Payment
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
            {/* Step 1: Customer Details & Address */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-charcoal-900 mb-6">
                  Customer Details & Address
                </h2>

                {/* Order for someone else checkbox - only show if user is logged in */}
                {user && profile && (
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderForSomeoneElse}
                        onChange={(e) => {
                          setOrderForSomeoneElse(e.target.checked)
                          // Clear form if unchecking
                          if (!e.target.checked && profile) {
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
                        }}
                        className="w-5 h-5 text-charcoal-900 border-beige-300 rounded focus:ring-2 focus:ring-charcoal-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-charcoal-900">
                          Order for someone else
                        </span>
                        <p className="text-xs text-charcoal-600 mt-1">
                          {orderForSomeoneElse
                            ? 'Enter recipient details below'
                            : 'Using your profile information'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Show profile summary if not ordering for someone else and profile exists */}
                {user && profile && !orderForSomeoneElse && (
                  <div className="bg-beige-50 border border-beige-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal-900 mb-2">
                          Using your profile information
                        </p>
                        <div className="text-sm text-charcoal-700 space-y-1">
                          <p>
                            <span className="font-medium">Name:</span> {customerDetails.name}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {customerDetails.email}
                          </p>
                          {customerDetails.phone && (
                            <p>
                              <span className="font-medium">Phone:</span> {customerDetails.phone}
                            </p>
                          )}
                          {shippingAddress.street && (
                            <div className="mt-2 pt-2 border-t border-beige-300">
                              <p className="font-medium mb-1">Shipping Address:</p>
                              <p className="text-charcoal-600">
                                {shippingAddress.street}
                                <br />
                                {shippingAddress.city}, {shippingAddress.state}{' '}
                                {shippingAddress.zipCode}
                                <br />
                                {shippingAddress.country}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOrderForSomeoneElse(true)}
                        className="text-sm text-charcoal-600 hover:text-charcoal-900 underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                <div className={`space-y-4 ${user && profile && !orderForSomeoneElse ? 'hidden' : ''}`}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={customerDetails.name}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-beige-300'
                      } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={customerDetails.email}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, email: e.target.value })
                      }
                      disabled={user && !orderForSomeoneElse}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.email ? 'border-red-500' : 'border-beige-300'
                      } focus:outline-none focus:ring-2 focus:ring-charcoal-500 ${
                        user && !orderForSomeoneElse ? 'bg-beige-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={customerDetails.phone}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.phone ? 'border-red-500' : 'border-beige-300'
                      } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className={`border-t border-beige-200 pt-6 mt-6 ${user && profile && !orderForSomeoneElse ? 'hidden' : ''}`}>
                    <h3 className="text-lg font-heading text-charcoal-900 mb-4">
                      Shipping Address
                    </h3>

                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-charcoal-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="street"
                        value={shippingAddress.street}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, street: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.street ? 'border-red-500' : 'border-beige-300'
                        } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.street && (
                        <p className="text-sm text-red-600 mt-1">{errors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-charcoal-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, city: e.target.value })
                          }
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.city ? 'border-red-500' : 'border-beige-300'
                          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-charcoal-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, state: e.target.value })
                          }
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.state ? 'border-red-500' : 'border-beige-300'
                          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                        />
                        {errors.state && (
                          <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-charcoal-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              zipCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                            })
                          }
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.zipCode ? 'border-red-500' : 'border-beige-300'
                          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-charcoal-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          id="country"
                          value={shippingAddress.country}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, country: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={() => navigate('/cart')}>
                    Back to Cart
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Preferences & Gift Note */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-charcoal-900 mb-6">
                  Delivery Preferences & Gift Note
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Preferred Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="deliveryDate"
                      value={deliveryPreferences.deliveryDate}
                      onChange={(e) =>
                        setDeliveryPreferences({
                          ...deliveryPreferences,
                          deliveryDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="giftNote" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Gift Message (Optional)
                    </label>
                    <textarea
                      id="giftNote"
                      value={deliveryPreferences.giftNote}
                      onChange={(e) =>
                        setDeliveryPreferences({
                          ...deliveryPreferences,
                          giftNote: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Add a personal message for the recipient..."
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Summary & Place Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-charcoal-900 mb-6">
                  Payment Summary
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-heading text-charcoal-900 mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-4">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-charcoal-700">
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="text-charcoal-900 font-medium">
                            ₹{item.line_total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-beige-200 pt-4 space-y-2">
                      <div className="flex justify-between text-charcoal-700">
                        <span>Subtotal</span>
                        <span>₹{cart.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-700">
                        <span>Shipping</span>
                        <span>Calculated at delivery</span>
                      </div>
                      <div className="border-t border-beige-200 pt-2 flex justify-between text-xl font-heading text-charcoal-900">
                        <span>Total</span>
                        <span>₹{cart.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div>
                    {createdOrderId ? (
                      <PaymentSection 
                        amount={cart.total} 
                        currency="INR" 
                        orderId={createdOrderId}
                      />
                    ) : (
                      <div className="text-sm text-charcoal-600">
                        Preparing payment...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t border-beige-200">
                  <Button variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handlePlaceOrder}
                    isLoading={placeOrderMutation.isPending}
                    disabled={placeOrderMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    Confirm & Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
