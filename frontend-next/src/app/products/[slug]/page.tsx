import { catalogApi } from '@/lib/api/endpoints/catalog'
import { ProductDetail } from '@/components/ProductDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await catalogApi.fetchProduct(slug)
    return { 
      title: product.name, 
      description: product.description 
    }
  } catch {
    return { title: 'Product Not Found' }
  }
}

import type { Product } from '@/lib/api/endpoints/catalog'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let product: Product | null = null
  let relatedProducts: Product[] = []

  try {
    const fetchedProduct = await catalogApi.fetchProduct(slug)
    product = fetchedProduct
    
    const allProducts = await catalogApi.fetchProducts().catch(() => [])
    relatedProducts = allProducts
      .filter((p) => p.category.id === fetchedProduct.category.id && p.id !== fetchedProduct.id)
      .slice(0, 4)
  } catch (e) {
    console.error('Error fetching product:', e)
    notFound()
  }

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
