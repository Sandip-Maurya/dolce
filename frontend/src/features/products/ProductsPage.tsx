import { useState, useMemo, useEffect } from 'react'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useProducts } from '../../lib/hooks/useProducts'
import { useAddToCart } from '../../lib/hooks/useCart'
import type { Product } from '../../lib/api/endpoints/catalog'
import { Link } from 'react-router-dom'
import { FilterSidebar } from '../../components/FilterSidebar'
import { SortDropdown } from '../../components/SortDropdown'
import toast from 'react-hot-toast'

type SortOption = 'price-low' | 'price-high' | 'newest'

function ProductCard({ product }: { product: Product }) {
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
      }
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full flex flex-col">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-beige-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            {product.tags.slice(0, 2).map((tag) => (
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
          <Link to={`/products/${product.slug}`} className="block">
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
          <Link to={`/products/${product.slug}`} className="flex-1 min-w-0">
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

export function ProductsPage() {
  const { data: products, isLoading, error } = useProducts()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const categories: Product['category'][] = ['COOKIE', 'SNACK', 'CAKE', 'SWEET', 'HAMPER']
  const availableTags = ['organic', 'sugar-free', 'eco-friendly', 'artisan', 'guilt-free']

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return []

    let filtered = products.filter((product) => {
      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDescription = product.description.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) {
          return false
        }
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false
      }

      // Tag filter (product must have at least one selected tag)
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) => product.tags.includes(tag))
        if (!hasSelectedTag) return false
      }

      return true
    })

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'newest':
          // Sort by ID (higher ID = newer in mock data)
          return parseInt(b.id) - parseInt(a.id)
        default:
          return 0
      }
    })

    return filtered
  }, [products, selectedCategories, selectedTags, sortOption, searchQuery])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTags([])
    setSearchQuery('')
    setSortOption('newest')
  }

  const activeFilters = [
    ...selectedCategories.map((cat) => ({
      type: 'category' as const,
      label: cat.charAt(0) + cat.slice(1).toLowerCase(),
      value: cat,
    })),
    ...selectedTags.map((tag) => ({
      type: 'tag' as const,
      label: tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' '),
      value: tag,
    })),
  ]

  const removeFilter = (type: 'category' | 'tag', value: string) => {
    if (type === 'category') {
      setSelectedCategories((prev) => prev.filter((c) => c !== value))
    } else {
      setSelectedTags((prev) => prev.filter((t) => t !== value))
    }
  }

  // Keyboard navigation: ESC to close mobile filter drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false)
      }
    }

    if (isMobileFilterOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isMobileFilterOpen])

  if (isLoading) {
    return (
      <Container>
        <div className="py-12">
          <SectionTitle
            title="Our Products"
            subtitle="Premium, handcrafted gift hampers and treats"
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse"
              >
                <div className="aspect-square w-full bg-beige-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-beige-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-beige-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-beige-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-red-600">Error loading products</div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-12">
        <SectionTitle
          title="Our Products"
          subtitle="Premium, handcrafted gift hampers and treats"
          align="center"
        />

        {/* Mobile Filter Toggle Button - Sticky */}
        <div className="sticky top-16 z-30 bg-beige-50 -mx-4 px-4 py-3 mt-8 mb-4 lg:hidden border-b border-beige-200 shadow-sm">
          <Button
            variant="secondary"
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full sm:w-auto"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filters
            {(selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery.length > 0) && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-charcoal-900 text-beige-50 rounded-full">
                {selectedCategories.length + selectedTags.length + (searchQuery.length > 0 ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-8 mt-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearFilters={clearFilters}
            isMobile={false}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={(cat) => {
              toggleCategory(cat)
              setIsMobileFilterOpen(false)
            }}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={(tag) => {
              toggleTag(tag)
              setIsMobileFilterOpen(false)
            }}
            onClearFilters={() => {
              clearFilters()
              setIsMobileFilterOpen(false)
            }}
            isMobile={true}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: Sort + Results Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-charcoal-600">
                  Showing <span className="font-medium text-charcoal-900">
                    {filteredAndSortedProducts.length}
                  </span>{' '}
                  of <span className="font-medium text-charcoal-900">
                    {products?.length || 0}
                  </span>{' '}
                  products
                </p>
              </div>
              <SortDropdown value={sortOption} onChange={setSortOption} />
            </div>

            {/* Active Filter Pills */}
            {(activeFilters.length > 0 || searchQuery.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {searchQuery.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-beige-100 text-charcoal-700 rounded-full text-sm">
                    <span>Search: "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-charcoal-500 hover:text-charcoal-900 transition-colors"
                      aria-label="Remove search"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                )}
                {activeFilters.map((filter) => (
                  <div
                    key={`${filter.type}-${filter.value}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-beige-100 text-charcoal-700 rounded-full text-sm"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      className="text-charcoal-500 hover:text-charcoal-900 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-charcoal-600 py-12">
              {products && products.length > 0 ? (
                <>
                  <svg
                    className="h-16 w-16 mx-auto text-charcoal-300 mb-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <p className="text-lg font-medium text-charcoal-900 mb-2">
                    No products match your filters
                  </p>
                  <p className="text-sm text-charcoal-600 mb-6">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-charcoal-900 mb-2">
                    No products available
                  </p>
                  <p className="text-sm text-charcoal-600">
                    Check back soon for new products.
                  </p>
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </Container>
  )
}

