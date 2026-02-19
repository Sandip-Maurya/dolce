import Link from 'next/link'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import { Button } from '@/components/Button'
import { ProductCard } from '@/components/ProductCard'
import type { SeasonalSection as SeasonalSectionType } from '@/lib/api/endpoints/content'
import type { Product } from '@/lib/api/endpoints/catalog'

interface SeasonalSectionProps {
  data: SeasonalSectionType | null
  products: Product[]
}

export function SeasonalSection({ data, products }: SeasonalSectionProps) {
  if (!data) return null

  const featuredProducts =
    data.featured_product_ids?.length > 0
      ? data.featured_product_ids
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => p != null)
          .slice(0, 3)
      : products.slice(0, 3)

  const startDate = new Date(data.start_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
  const endDate = new Date(data.end_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div
      className="w-full"
      style={
        data.background_color
          ? { backgroundColor: data.background_color }
          : undefined
      }
    >
      <Container>
        <div className="py-12 sm:py-16">
          <SectionTitle
            title={data.title}
            subtitle={data.subtitle}
            align="center"
          />
          {data.badge_text && (
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-sm font-medium">
                {data.badge_text}
              </span>
            </div>
          )}
          {(data.start_date || data.end_date) && (
            <p className="text-center text-charcoal-600 text-sm mb-8">
              {startDate} – {endDate}
            </p>
          )}
          {featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center">
            <Link href={data.cta_link}>
              <Button variant="primary">{data.cta_text}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
