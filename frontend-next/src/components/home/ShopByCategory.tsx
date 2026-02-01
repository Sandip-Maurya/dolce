import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import type { Category } from '@/lib/api/endpoints/catalog'

interface ShopByCategoryProps {
  categories: Category[]
  allCategoriesFallback?: Category[]
}

const placeholderImage = 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80&auto=format&fit=crop'

export function ShopByCategory({ categories, allCategoriesFallback }: ShopByCategoryProps) {
  const list = categories.length > 0 ? categories : (allCategoriesFallback ?? []).slice(0, 6)

  if (list.length === 0) {
    return null
  }

  return (
    <Container>
      <SectionTitle
        title="Shop by Category"
        subtitle="Find the perfect hamper or treat for every occasion"
        align="center"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {list.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group block rounded-xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-beige-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-beige-100">
              <Image
                src={cat.homepage_image_url || placeholderImage}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="p-4 text-center">
              <span className="font-heading text-charcoal-900 font-medium group-hover:text-charcoal-700">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
