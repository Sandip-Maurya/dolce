import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { paymentsApi, type PaymentOrderResponse } from '../../lib/api/endpoints/payments'

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentSectionProps {
  amount: number
  currency?: string
  orderId: string
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
  onPaymentOrderCreated?: (paymentOrder: PaymentOrderResponse) => void
}

export function PaymentSection({
  amount,
  currency = 'INR',
  orderId,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentOrderCreated,
}: PaymentSectionProps) {
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [razorpayReady, setRazorpayReady] = useState(false)
  const razorpayLoaded = useRef(false)

  // Load Razorpay script
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript || window.Razorpay) {
      razorpayLoaded.current = true
      setRazorpayReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      // Wait a bit for Razorpay to initialize
      setTimeout(() => {
        if (window.Razorpay) {
          razorpayLoaded.current = true
          setRazorpayReady(true)
        } else {
          console.error('Razorpay SDK not available after script load')
          setError('Failed to initialize Razorpay SDK. Please refresh the page.')
        }
      }, 100)
    }
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      setError('Failed to load Razorpay SDK. Please refresh the page.')
    }
    document.body.appendChild(script)
  }, [])

  // Create payment order when component mounts or amount/orderId changes
  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 1000 // 1 second

    const createPaymentOrder = async (retry = false) => {
      if (!isMounted) return

      if (!retry) {
        setIsLoading(true)
        setError(null)
      }

      try {
        const response = await paymentsApi.createPaymentOrder({
          amount,
          currency,
          orderId,
        })
        
        if (!isMounted) return
        
        if (!response.key) {
          console.error('Payment order response missing key field')
          throw new Error('Payment gateway key not available. Please check backend configuration.')
        }
        
        setPaymentOrder(response)
        onPaymentOrderCreated?.(response)
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return

        console.error('❌ Error creating payment order:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment order'
        const errorData = err instanceof Error && 'data' in err ? (err as any).data : null
        
        console.error('Error details:', {
          errorMessage,
          errorData,
          errorType: err instanceof Error ? err.constructor.name : typeof err
        })
        
        // Check if it's an "Order not found" error - might be a race condition
        if (errorData?.error === 'Order not found' && retryCount < maxRetries) {
          retryCount++
          setTimeout(() => {
            if (isMounted) {
              createPaymentOrder(true)
            }
          }, retryDelay)
          return
        }

        // Check if it's an authentication error
        if (errorMessage.includes('Authentication failed') || errorData?.error?.includes('authentication')) {
          console.error('Razorpay authentication error:', errorData)
          setError('Razorpay authentication failed. Please check your Razorpay credentials.')
          toast.error('Payment gateway authentication failed. Please contact support.')
        } else {
          setError(errorMessage)
          toast.error(errorMessage)
        }
        
        setIsLoading(false)
      }
    }

    if (amount > 0 && orderId) {
      // Small delay to ensure order is fully saved
      const timer = setTimeout(() => {
        createPaymentOrder()
      }, 500)
      
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, orderId])

  const handlePayment = async () => {
    if (!paymentOrder) {
      toast.error('Payment order not ready. Please wait...')
      return
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.')
      setError('Razorpay SDK not loaded. Please refresh the page.')
      return
    }

    if (isProcessing) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Ensure amount is a number
      const amountInPaise = Math.round(Number(paymentOrder.amount) * 100)
      
      if (!paymentOrder.key) {
        throw new Error('Payment key not available')
      }

      if (!paymentOrder.paymentOrderId) {
        throw new Error('Payment order ID not available')
      }

      const options = {
        key: paymentOrder.key,
        amount: amountInPaise, // Convert to paise
        currency: paymentOrder.currency || 'INR',
        name: 'Dolce Fiore',
        description: `Order Payment - ${orderId}`,
        order_id: paymentOrder.paymentOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            await paymentsApi.verifyPayment({
              paymentId: response.razorpay_payment_id,
              orderId: orderId,
              signature: response.razorpay_signature,
            })

            toast.success('Payment successful!')
            onPaymentSuccess?.()
          } catch (err) {
            console.error('Payment verification error', err)
            const errorMessage = err instanceof Error ? err.message : 'Payment verification failed'
            toast.error(errorMessage)
            setError(errorMessage)
            onPaymentFailure?.()
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          // You can prefill customer details here if available
        },
        theme: {
          color: '#1a1a1a', // Charcoal color matching your theme
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error('Payment cancelled')
            // User closed the payment modal
          },
        },
        // Ensure popup opens properly
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'wallet',
                  },
                  {
                    method: 'upi',
                  },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed', response)
        const errorMessage = response.error?.description || 'Payment failed'
        toast.error(errorMessage)
        setError(errorMessage)
        setIsProcessing(false)
        onPaymentFailure?.()
      })

      // Open Razorpay checkout
      try {
        razorpay.open()
      } catch (openError) {
        console.error('Error opening Razorpay:', openError)
        throw openError
      }
    } catch (err) {
      console.error('Error initializing payment', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment'
      toast.error(errorMessage)
      setError(errorMessage)
      setIsProcessing(false)
      onPaymentFailure?.()
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading text-charcoal-900 mb-4">Payment</h3>
      
      {isLoading && (
        <div className="text-sm text-charcoal-600">Preparing payment...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Always show payment section when we have orderId */}
      {orderId && (
        <div className="bg-beige-50 p-4 rounded-lg space-y-4">
          {paymentOrder ? (
            <>
              <div className="space-y-2">
                <div className="text-sm text-charcoal-600">
                  <span className="font-medium">Payment Provider:</span> {paymentOrder.provider}
                </div>
                <div className="text-sm text-charcoal-600">
                  <span className="font-medium">Amount:</span> ₹{paymentOrder.amount.toLocaleString()}
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handlePayment()
                }}
                disabled={isProcessing || !razorpayReady || !paymentOrder?.key}
                className="w-full px-6 py-3 bg-charcoal-900 text-beige-50 rounded-lg font-medium hover:bg-charcoal-800 disabled:bg-charcoal-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>

              <div className="text-xs space-y-1">
                {!razorpayReady && (
                  <p className="text-charcoal-500">
                    ⏳ Loading payment gateway...
                  </p>
                )}
                {!paymentOrder.key && (
                  <p className="text-red-500">
                    ❌ Payment key not available. Please check your Razorpay configuration.
                  </p>
                )}
                {razorpayReady && paymentOrder.key && !isProcessing && (
                  <p className="text-green-600">
                    Ready to process payment
                  </p>
                )}
                {isProcessing && (
                  <p className="text-blue-600">
                    Opening payment gateway...
                  </p>
                )}
              </div>
            </>
          ) : isLoading ? (
            <div className="text-sm text-charcoal-600">
              Creating payment order... (This may take a few seconds)
            </div>
          ) : (
            <div className="text-sm text-charcoal-600">
              Waiting for payment order to be created...
            </div>
          )}
        </div>
      )}
      
      {/* Show error if orderId is missing */}
      {!orderId && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">
            ❌ Order ID is missing. Please complete the previous steps.
          </p>
        </div>
      )}
    </div>
  )
}

