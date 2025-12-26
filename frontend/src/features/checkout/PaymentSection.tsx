import { useState, useEffect } from 'react'
import { paymentsApi, type PaymentOrderResponse } from '../../lib/api/endpoints/payments'

interface PaymentSectionProps {
  amount: number
  currency?: string
  orderId: string
  onPaymentOrderCreated?: (paymentOrder: PaymentOrderResponse) => void
}

export function PaymentSection({
  amount,
  currency = 'INR',
  orderId,
  onPaymentOrderCreated,
}: PaymentSectionProps) {
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create payment order when component mounts or amount/orderId changes
    const createPaymentOrder = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await paymentsApi.createPaymentOrder({
          amount,
          currency,
          orderId,
        })
        setPaymentOrder(response)
        onPaymentOrderCreated?.(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment order')
      } finally {
        setIsLoading(false)
      }
    }

    if (amount > 0 && orderId) {
      createPaymentOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, orderId])

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

      {paymentOrder && (
        <div className="bg-beige-50 p-4 rounded-lg space-y-2">
          <div className="text-sm text-charcoal-600">
            <span className="font-medium">Payment Provider:</span> {paymentOrder.provider}
          </div>
          <div className="text-sm text-charcoal-600">
            <span className="font-medium">Payment Order ID:</span>{' '}
            <span className="font-mono text-xs">{paymentOrder.paymentOrderId}</span>
          </div>
          <div className="text-xs text-charcoal-500 mt-2">
            Payment gateway integration will be added here (Razorpay/Stripe)
          </div>
        </div>
      )}

      <div className="text-sm text-charcoal-600 pt-2 border-t border-beige-200">
        <p>
          For now, clicking "Confirm & Place Order" will complete your order. 
          Real payment processing will be integrated in the next phase.
        </p>
      </div>
    </div>
  )
}

