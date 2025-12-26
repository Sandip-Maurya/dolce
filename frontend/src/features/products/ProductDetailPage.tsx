import { useParams, Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { SectionTitle } from '../../components/SectionTitle'
import { SkeletonLoader } from '../../components/SkeletonLoader'
import { useProduct, useProducts } from '../../lib/hooks/useProducts'
import { useAddToCart } from '../../lib/hooks/useCart'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug || '')
  const { data: allProducts } = useProducts()
  const addToCartMutation = useAddToCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Get related products (same category, exclude current product)
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return []
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product, allProducts])

  if (isLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Skeleton */}
            <div>
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-beige-100 mb-4">
                <SkeletonLoader type="image" className="w-full h-full" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden">
                    <SkeletonLoader type="image" className="w-full h-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div>
              <div className="flex gap-2 mb-4">
                <SkeletonLoader type="text" width={80} height={24} className="rounded" />
                <SkeletonLoader type="text" width={100} height={24} className="rounded" />
              </div>
              <SkeletonLoader type="text" width="80%" height={48} className="rounded mb-4" />
              <SkeletonLoader type="text" width={120} height={36} className="rounded mb-6" />
              <div className="space-y-3 mb-8">
                <SkeletonLoader type="text" width="100%" height={20} className="rounded" />
                <SkeletonLoader type="text" width="95%" height={20} className="rounded" />
                <SkeletonLoader type="text" width="90%" height={20} className="rounded" />
              </div>
              <SkeletonLoader type="text" width={100} height={20} className="rounded mb-6" />
              <SkeletonLoader type="text" width="100%" height={48} className="rounded" />
            </div>
          </div>
        </div>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-red-600 mb-4">Product not found</div>
          <Link to="/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </Container>
    )
  }

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Product added to cart!')
        },
      }
    )
  }

  return (
    <Container>
      <div className="py-12">
        <Link
          to="/products"
          className="text-charcoal-600 hover:text-charcoal-900 mb-6 inline-block"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-beige-100 mb-4 group">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                key={selectedImageIndex}
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-charcoal-900 ring-2 ring-charcoal-900 ring-offset-2'
                        : 'border-beige-200 hover:border-charcoal-400'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
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
                <Link key={relatedProduct.id} to={`/products/${relatedProduct.slug}`}>
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

