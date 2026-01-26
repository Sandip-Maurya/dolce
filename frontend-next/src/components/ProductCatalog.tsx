'use client'

import { useState, useMemo, useEffect } from 'react'
import { Container } from './Container'
import { SectionTitle } from './SectionTitle'
import { Button } from './Button'
import { FilterSidebar } from './FilterSidebar'
import { SortDropdown, type SortOption } from './SortDropdown'
import { ProductCard } from './ProductCard'
import type { Product, CategoryWithSubcategories, Tag } from '../lib/api/endpoints/catalog'

interface ProductCatalogProps {
  initialProducts: Product[]
  categories: CategoryWithSubcategories[]
  tags: Tag[]
}

export function ProductCatalog({ initialProducts, categories, tags }: ProductCatalogProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = initialProducts.filter((product) => {
      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDescription = product.description.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) {
          return false
        }
      }

      // Category and Subcategory filter
      // Priority: subcategories are more specific than category
      if (selectedSubcategories.length > 0) {
        // Filter by specific subcategories (most specific)
        const productSubcategoryId = product.subcategory?.id
        const productSubcategorySlug = product.subcategory?.slug
        const matchesSubcategory = selectedSubcategories.some((subcatId) =>
          subcatId === productSubcategoryId || subcatId === productSubcategorySlug
        )
        if (!matchesSubcategory) {
          return false
        }
      } else if (expandedCategoryId) {
        // Filter by expanded category (when no subcategories are selected)
        // This includes all products in the category and its subcategories
        const productCategoryId = product.category.id
        const productCategorySlug = product.category.slug
        if (expandedCategoryId !== productCategoryId && expandedCategoryId !== productCategorySlug) {
          return false
        }
      }
      // If no category is expanded and no subcategories are selected, show all products

      // Tag filter (product must have at least one selected tag)
      if (selectedTags.length > 0) {
        const productTagIds = product.tags.map(t => t.id)
        const productTagSlugs = product.tags.map(t => t.slug)
        const hasSelectedTag = selectedTags.some((tagId) => 
          productTagIds.includes(tagId) || productTagSlugs.includes(tagId)
        )
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
  }, [initialProducts, selectedSubcategories, expandedCategoryId, selectedTags, sortOption, searchQuery])

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => {
      // Check if subcategory is already selected (by ID or slug)
      const subcategory = categories
        .flatMap(c => c.subcategories || [])
        .find(s => s.id === subcategoryId || s.slug === subcategoryId)
      
      const isSelected = prev.some((id) => 
        id === subcategoryId || 
        id === subcategory?.id || 
        id === subcategory?.slug
      )
      
      if (isSelected) {
        // Remove subcategory (by ID or slug)
        return prev.filter((id) => 
          id !== subcategoryId && 
          id !== subcategory?.id && 
          id !== subcategory?.slug
        )
      } else {
        // Add subcategory
        return [...prev, subcategoryId]
      }
    })
  }

  const clearSubcategories = () => {
    setSelectedSubcategories([])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedSubcategories([])
    setSelectedTags([])
    setExpandedCategoryId(null)
    setSearchQuery('')
    setSortOption('newest')
  }

  const activeFilters = [
    // Show expanded category as filter only when no subcategories are selected
    ...(expandedCategoryId && selectedSubcategories.length === 0 ? [{
      type: 'category' as const,
      label: categories.find(c => c.id === expandedCategoryId || c.slug === expandedCategoryId)?.name || expandedCategoryId,
      value: expandedCategoryId,
    }] : []),
    ...selectedSubcategories.map((subcatId) => {
      const subcategory = categories
        .flatMap(c => c.subcategories || [])
        .find(s => s.id === subcatId || s.slug === subcatId)
      return {
        type: 'subcategory' as const,
        label: subcategory?.name || subcatId,
        value: subcatId,
      }
    }),
    ...selectedTags.map((tagId) => {
      const tag = tags.find(t => t.id === tagId || t.slug === tagId)
      return {
        type: 'tag' as const,
        label: tag?.name || tagId,
        value: tagId,
      }
    }),
  ]

  const removeFilter = (type: 'category' | 'subcategory' | 'tag', value: string) => {
    if (type === 'category') {
      // Collapse the category when removing the filter
      setExpandedCategoryId(null)
    } else if (type === 'subcategory') {
      setSelectedSubcategories((prev) => prev.filter((id) => id !== value))
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
            {((expandedCategoryId && selectedSubcategories.length === 0) || selectedSubcategories.length > 0 || selectedTags.length > 0 || searchQuery.length > 0) && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-charcoal-900 text-beige-50 rounded-full">
                {(expandedCategoryId && selectedSubcategories.length === 0 ? 1 : 0) + selectedSubcategories.length + selectedTags.length + (searchQuery.length > 0 ? 1 : 0)}
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
            selectedSubcategories={selectedSubcategories}
            onToggleSubcategory={toggleSubcategory}
            onClearSubcategories={clearSubcategories}
            expandedCategoryId={expandedCategoryId}
            onExpandedCategoryChange={setExpandedCategoryId}
            availableTags={tags}
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
            selectedSubcategories={selectedSubcategories}
            onToggleSubcategory={(subcatId) => {
              toggleSubcategory(subcatId)
              setIsMobileFilterOpen(false)
            }}
            onClearSubcategories={clearSubcategories}
            expandedCategoryId={expandedCategoryId}
            onExpandedCategoryChange={setExpandedCategoryId}
            availableTags={tags}
            selectedTags={selectedTags}
            onToggleTag={(tagId) => {
              toggleTag(tagId)
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
                    {initialProducts.length}
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
                    <span>Search: &quot;{searchQuery}&quot;</span>
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
                {initialProducts.length > 0 ? (
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
                      Try adjusting your search or filters to find what you&apos;re looking for.
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
