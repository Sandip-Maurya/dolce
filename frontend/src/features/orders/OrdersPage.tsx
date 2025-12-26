import { Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { useOrders } from '../../lib/hooks/useOrders'
import { ApiError } from '../../lib/api/client'

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

export function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()

  if (isLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-charcoal-600">Loading orders...</div>
        </div>
      </Container>
    )
  }

  if (error) {
    // Check if the error is due to authentication (401 or 403)
    const isAuthError = error instanceof ApiError && (error.status === 401 || error.status === 403)
    
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-red-600">
            {isAuthError ? 'You are not logged in' : 'Error loading orders'}
          </div>
        </div>
      </Container>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Container>
        <div className="py-12">
          <SectionTitle title="My Orders" align="center" />
          <div className="text-center py-12">
            <p className="text-charcoal-600 mb-6">You haven't placed any orders yet.</p>
            <Link to="/products">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <Container>
      <div className="py-12">
        <SectionTitle title="My Orders" align="center" />

        <div className="mt-8 space-y-6">
          {sortedOrders.map((order) => {
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-card p-6 sm:p-8"
              >
                {/* Order Header - Mobile: Stacked, Desktop: Side by side */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-beige-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-heading text-charcoal-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                          statusColors[order.status] || statusColors.PLACED
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-600">Placed on {formattedDate}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-2xl font-heading text-charcoal-900">
                      ₹{order.total.toLocaleString()}
                    </div>
                    <Link to={`/checkout/confirmation/${order.id}`}>
                      <Button variant="ghost" className="text-sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-charcoal-700 uppercase tracking-wide">
                    Items ({order.items.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 bg-beige-50 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-beige-100 flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="text-sm font-medium text-charcoal-900 mb-1 truncate">
                            {item.product.name}
                          </h5>
                          <div className="flex flex-wrap gap-1 mb-1">
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
                          <p className="text-xs text-charcoal-600 mb-1">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-charcoal-900">
                            ₹{item.line_total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Timeline - Simple status indicator */}
                <div className="mt-6 pt-6 border-t border-beige-200">
                  <div className="flex items-center gap-2 text-sm text-charcoal-600">
                    <span className="font-medium">Status:</span>
                    <span>{statusLabels[order.status] || order.status}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Container>
  )
}
