import { useParams, Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { useOrders } from '../../lib/hooks/useOrders'

const statusLabels: Record<string, string> = {
  PLACED: 'Order Placed',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
}

const statusColors: Record<string, string> = {
  PLACED: 'bg-beige-200 text-charcoal-900',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
}

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  const { data: orders, isLoading } = useOrders()

  const order = orders?.find((o) => o.id === orderId)

  if (isLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-charcoal-600">Loading order...</div>
        </div>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container>
        <div className="py-12">
          <SectionTitle title="Order Not Found" align="center" />
          <div className="text-center py-12">
            <p className="text-charcoal-600 mb-6">We couldn't find this order.</p>
            <Link to="/orders">
              <Button variant="primary">View All Orders</Button>
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Container>
      <div className="py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-4xl font-heading text-charcoal-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-charcoal-700 mb-2">
              Your order has been placed successfully. We're preparing your handcrafted treats with care.
            </p>
            <p className="text-base text-charcoal-600">
              Order ID: <span className="font-mono font-medium">{order.id}</span>
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl shadow-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-beige-200">
              <div>
                <h2 className="text-2xl font-heading text-charcoal-900 mb-2">Order Summary</h2>
                <p className="text-sm text-charcoal-600">Placed on {formattedDate}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    statusColors[order.status] || statusColors.PLACED
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-heading text-charcoal-900">Items</h3>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-beige-50 rounded-lg"
                >
                  <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-beige-100 flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.product.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          label={tag}
                          type={
                            tag === 'organic'
                              ? 'organic'
                              : tag === 'eco-friendly'
                                ? 'eco-friendly'
                                : tag === 'sugar-free'
                                  ? 'sugar-free'
                                  : tag === 'artisan'
                                    ? 'artisan'
                                    : 'custom'
                          }
                        />
                      ))}
                    </div>
                    <h4 className="text-lg font-heading text-charcoal-900 mb-1">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-charcoal-600 mb-2">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-lg font-heading text-charcoal-900">
                      ₹{item.line_total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-beige-200 pt-6">
              <div className="flex justify-between text-2xl font-heading text-charcoal-900">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Brand Messaging */}
          <div className="bg-beige-50 rounded-xl p-6 sm:p-8 mb-8 text-center">
            <h3 className="text-xl font-heading text-charcoal-900 mb-4">
              Handcrafted with Care
            </h3>
            <p className="text-charcoal-700 leading-relaxed mb-4">
              Your order is being prepared by our team of skilled artisans who take pride in 
              creating premium, sustainable treats. Every item is carefully handcrafted and 
              packaged with eco-friendly materials.
            </p>
            <p className="text-charcoal-600 text-sm">
              We'll send you updates as your order progresses. Thank you for choosing Dolce Fiore!
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button variant="primary" className="w-full sm:w-auto">
                View All Orders
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}

