'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from './Badge'
import { Button } from './Button'
import { useAddToCart } from '../lib/hooks/useCart'
import type { Product } from '../lib/api/endpoints/catalog'
import { ApiError } from '../lib/api/client'
import toast from 'react-hot-toast'

export function ProductCard({ product }: { product: Product }) {
  const addToCartMutation = useAddToCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCartMutation.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Product added to cart!')
        },
        onError: (error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            toast.error('Please login to add product to cart.')
          } else {
            toast.error(error instanceof Error ? error.message : 'Failed to add product to cart')
          }
        },
      }
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-beige-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                label={tag.name}
                type={
                  tag.slug === 'organic'
                    ? 'organic'
                    : tag.slug === 'eco-friendly'
                      ? 'eco-friendly'
                      : tag.slug === 'sugar-free'
                        ? 'sugar-free'
                        : tag.slug === 'artisan'
                          ? 'artisan'
                          : 'custom'
                }
              />
            ))}
          </div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xl font-heading text-charcoal-900 mb-2 hover:text-charcoal-700">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="text-sm text-charcoal-600 mb-4">
            ₹{product.price.toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2 mt-auto pt-4 border-t border-beige-200">
          <Link href={`/products/${product.slug}`} className="flex-1 min-w-0">
            <Button variant="secondary" className="w-full text-sm px-3 sm:px-4 py-2 whitespace-nowrap">
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            className="flex-1 min-w-0 text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
            onClick={handleAddToCart}
            isLoading={addToCartMutation.isPending}
            disabled={!product.is_available}
          >
            <span className="hidden sm:inline">{product.is_available ? 'Add to Cart' : 'Out of Stock'}</span>
            <span className="sm:hidden">{product.is_available ? 'Add' : 'Out'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
