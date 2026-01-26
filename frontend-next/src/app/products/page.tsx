import { catalogApi } from '@/lib/api/endpoints/catalog'
import { ProductCatalog } from '@/components/ProductCatalog'

// Revalidate data every hour
export const revalidate = 3600

export default async function ProductsPage() {
  const [products, categories, tags] = await Promise.all([
    catalogApi.fetchProducts().catch((e) => {
        console.error('Failed to fetch products', e);
        return [];
    }),
    catalogApi.fetchCategoriesWithSubcategories().catch((e) => {
        console.error('Failed to fetch categories', e);
        return [];
    }),
    catalogApi.fetchTags().catch((e) => {
        console.error('Failed to fetch tags', e);
        return [];
    }),
  ])

  return (
    <ProductCatalog 
      initialProducts={products} 
      categories={categories} 
      tags={tags} 
    />
  )
}
