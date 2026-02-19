'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from './Container'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { SectionTitle } from './SectionTitle'
import { useAddToCart } from '../lib/hooks/useCart'
import { ApiError } from '../lib/api/client'
import type { Product } from '../lib/api/endpoints/catalog'
import toast from 'react-hot-toast'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const addToCartMutation = useAddToCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleAddToCart = () => {
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
    <Container>
      <div className="py-12">
        <Link
          href="/products"
          className="text-charcoal-600 hover:text-charcoal-900 mb-6 inline-block"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-beige-100 mb-4 group">
              <Image
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal-900 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Next Button */}
                  {selectedImageIndex < product.images.length - 1 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal-900 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-white/90 text-charcoal-900 text-sm px-3 py-1 rounded-full shadow-lg">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-charcoal-900 ring-2 ring-charcoal-900 ring-offset-2'
                        : 'border-beige-200 hover:border-charcoal-400'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag) => (
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

            <h1 className="text-4xl lg:text-5xl font-heading text-charcoal-900 mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-heading text-charcoal-900 mb-6">
              ₹{product.price.toLocaleString()}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-base text-charcoal-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {product.weight_grams && (
              <div className="text-sm text-charcoal-600 mb-6">
                Weight: {product.weight_grams}g
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleAddToCart}
                isLoading={addToCartMutation.isPending}
                disabled={!product.is_available}
                className="flex-1"
              >
                {product.is_available ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-beige-200">
            <SectionTitle
              title="Related Products"
              subtitle="More handcrafted treats you might love"
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="block h-full">
                  <Card
                    imageUrl={relatedProduct.images[0]}
                    imageAlt={relatedProduct.name}
                    hoverable
                    className="h-full flex flex-col"
                  >
                    <div className="flex-grow">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relatedProduct.tags.slice(0, 2).map((tag) => (
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
                      <h3 className="text-lg font-heading text-charcoal-900 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-charcoal-600 mb-4 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-beige-200">
                      <span className="text-xl font-heading text-charcoal-900">
                        ₹{relatedProduct.price.toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
