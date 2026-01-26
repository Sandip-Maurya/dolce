'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { paymentsApi, type PaymentOrderResponse } from '@/lib/api/endpoints/payments'

declare global {
  interface Window {
    Razorpay: unknown
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

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript || typeof window !== 'undefined' && window.Razorpay) {
      razorpayLoaded.current = true
      setRazorpayReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          razorpayLoaded.current = true
          setRazorpayReady(true)
        } else {
          setError('Failed to initialize Razorpay SDK. Please refresh the page.')
        }
      }, 100)
    }
    script.onerror = () => {
      setError('Failed to load Razorpay SDK. Please refresh the page.')
    }
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 1000

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
          throw new Error('Payment gateway key not available. Please check backend configuration.')
        }

        setPaymentOrder(response)
        onPaymentOrderCreated?.(response)
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return

        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment order'
        const errorData = err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { error?: string } }).data
          : null

        if (errorData?.error === 'Order not found' && retryCount < maxRetries) {
          retryCount++
          setTimeout(() => {
            if (isMounted) createPaymentOrder(true)
          }, retryDelay)
          return
        }

        if (errorMessage.includes('Authentication failed') || errorData?.error?.includes('authentication')) {
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
      const timer = setTimeout(() => createPaymentOrder(), 500)
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
  }, [amount, currency, orderId, onPaymentOrderCreated])

  const handlePayment = async () => {
    if (!paymentOrder) {
      toast.error('Payment order not ready. Please wait...')
      return
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.')
      setError('Razorpay SDK not loaded. Please refresh the page.')
      return
    }

    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const amountInPaise = Math.round(Number(paymentOrder.amount) * 100)

      if (!paymentOrder.key) throw new Error('Payment key not available')
      if (!paymentOrder.paymentOrderId) throw new Error('Payment order ID not available')

      const Razorpay = window.Razorpay as new (opts: Record<string, unknown>) => {
        open: () => void
        on: (ev: string, cb: (r: { error?: { description?: string } }) => void) => void
      }

      const options = {
        key: paymentOrder.key,
        amount: amountInPaise,
        currency: paymentOrder.currency || 'INR',
        name: 'Dolce Fiore',
        description: `Order Payment - ${orderId}`,
        order_id: paymentOrder.paymentOrderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await paymentsApi.verifyPayment({
              paymentId: response.razorpay_payment_id,
              orderId,
              signature: response.razorpay_signature,
            })
            toast.success('Payment successful!')
            onPaymentSuccess?.()
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Payment verification failed'
            toast.error(msg)
            setError(msg)
            onPaymentFailure?.()
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {},
        theme: { color: '#1a1a1a' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error('Payment cancelled')
          },
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                  { method: 'upi' },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: { show_default_blocks: true },
          },
        },
      }

      const razorpay = new Razorpay(options)

      razorpay.on('payment.failed', (response: { error?: { description?: string } }) => {
        const msg = response.error?.description || 'Payment failed'
        toast.error(msg)
        setError(msg)
        setIsProcessing(false)
        onPaymentFailure?.()
      })

      razorpay.open()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize payment'
      toast.error(msg)
      setError(msg)
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

      {orderId ? (
        <div className="bg-beige-50 p-4 rounded-lg space-y-4">
          {paymentOrder ? (
            <>
              <div className="space-y-2">
                <div className="text-sm text-charcoal-600">
                  <span className="font-medium">Payment Provider:</span> {paymentOrder.provider}
                </div>
                <div className="text-sm text-charcoal-600">
                  <span className="font-medium">Amount:</span> ₹{Number(paymentOrder.amount).toLocaleString()}
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
                  <p className="text-charcoal-500">Loading payment gateway...</p>
                )}
                {!paymentOrder.key && (
                  <p className="text-red-500">
                    Payment key not available. Please check your Razorpay configuration.
                  </p>
                )}
                {razorpayReady && paymentOrder.key && !isProcessing && (
                  <p className="text-green-600">Ready to process payment</p>
                )}
                {isProcessing && (
                  <p className="text-blue-600">Opening payment gateway...</p>
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
      ) : (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">
            Order ID is missing. Please complete the previous steps.
          </p>
        </div>
      )}
    </div>
  )
}
