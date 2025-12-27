import { useState, useEffect, useRef } from 'react'
import { SearchBar } from './SearchBar'
import type { CategoryWithSubcategories, Tag } from '../lib/api/endpoints/catalog'

interface FilterSidebarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  categories: CategoryWithSubcategories[]
  selectedSubcategories: string[]
  onToggleSubcategory: (subcategoryId: string) => void
  expandedCategoryId: string | null
  onExpandedCategoryChange: (categoryId: string | null) => void
  availableTags: Tag[]
  selectedTags: string[]
  onToggleTag: (tagId: string) => void
  onClearFilters: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function FilterSidebar({
  searchQuery,
  onSearchChange,
  categories,
  selectedSubcategories,
  onToggleSubcategory,
  expandedCategoryId,
  onExpandedCategoryChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  isMobile = false,
  isOpen = false,
  onClose,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    tags: true,
  })
  const drawerRef = useRef<HTMLDivElement>(null)

  // Focus management for mobile drawer
  useEffect(() => {
    if (isMobile && isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector(
        'input, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    }
  }, [isMobile, isOpen])

  // Auto-expand category when its subcategory is selected
  useEffect(() => {
    if (selectedSubcategories.length > 0) {
      // Find the category that contains the selected subcategory
      const categoryWithSubcategory = categories.find(c => 
        c.subcategories?.some(s => 
          selectedSubcategories.includes(s.id) || selectedSubcategories.includes(s.slug)
        )
      )
      if (categoryWithSubcategory && expandedCategoryId !== categoryWithSubcategory.id && expandedCategoryId !== categoryWithSubcategory.slug) {
        onExpandedCategoryChange(categoryWithSubcategory.id)
      }
    }
  }, [selectedSubcategories, categories, expandedCategoryId, onExpandedCategoryChange])

  const toggleSection = (section: 'category' | 'tags') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const hasActiveFilters = selectedSubcategories.length > 0 || selectedTags.length > 0 || searchQuery.length > 0

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-3 text-sm font-medium text-charcoal-900"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-charcoal-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span>Category</span>
            {selectedSubcategories.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-charcoal-900 text-beige-50 rounded-full">
                {selectedSubcategories.length}
              </span>
            )}
          </div>
          <svg
            className={`h-4 w-4 text-charcoal-500 transition-transform ${
              expandedSections.category ? 'rotate-180' : ''
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {expandedSections.category && (
          <div className="space-y-1">
            {categories.map((category) => {
              const isExpanded = expandedCategoryId === category.id || expandedCategoryId === category.slug
              const hasSubcategories = category.subcategories && category.subcategories.length > 0
              
              const handleCategoryClick = () => {
                // If clicking a different category, collapse previous and expand new
                if (expandedCategoryId !== category.id && expandedCategoryId !== category.slug) {
                  onExpandedCategoryChange(category.id)
                } else if (hasSubcategories) {
                  // Toggle expand/collapse only if category has subcategories
                  onExpandedCategoryChange(isExpanded ? null : category.id)
                }
              }
              
              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={handleCategoryClick}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-1 flex items-center justify-between bg-beige-100 text-charcoal-700 hover:bg-beige-200"
                  >
                    <span>{category.name}</span>
                    {hasSubcategories && (
                      <svg
                        className={`h-4 w-4 text-charcoal-500 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </button>
                  {isExpanded && hasSubcategories && (
                    <div className="pl-4 space-y-1">
                      {category.subcategories.map((subcategory) => {
                        const isSubcategorySelected = selectedSubcategories.some(
                          (id) => id === subcategory.id || id === subcategory.slug
                        )
                        return (
                          <button
                            key={subcategory.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleSubcategory(subcategory.id)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-1 ${
                              isSubcategorySelected
                                ? 'bg-charcoal-700 text-beige-50'
                                : 'bg-beige-50 text-charcoal-600 hover:bg-beige-100'
                            }`}
                          >
                            {subcategory.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tag Filters */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center justify-between w-full mb-3 text-sm font-medium text-charcoal-900"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-charcoal-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span>Tags</span>
            {selectedTags.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-charcoal-900 text-beige-50 rounded-full">
                {selectedTags.length}
              </span>
            )}
          </div>
          <svg
            className={`h-4 w-4 text-charcoal-500 transition-transform ${
              expandedSections.tags ? 'rotate-180' : ''
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {expandedSections.tags && (
          <div className="space-y-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id) || selectedTags.includes(tag.slug)
              return (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tag.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-1 ${
                    isSelected
                      ? 'bg-charcoal-900 text-beige-50'
                      : 'bg-beige-100 text-charcoal-700 hover:bg-beige-200'
                  }`}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-auto pt-4 border-t border-beige-200">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-charcoal-700 hover:text-charcoal-900 hover:bg-beige-100 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer */}
        <div
          ref={drawerRef}
          className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div className="h-full overflow-y-auto p-6">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading text-charcoal-900">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 text-charcoal-500 hover:text-charcoal-900 transition-colors"
                aria-label="Close filters"
              >
                <svg
                  className="h-5 w-5"
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
            {sidebarContent}
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-4 h-fit">
      <div className="bg-white rounded-xl border border-beige-200 p-6 shadow-soft">
        {sidebarContent}
      </div>
    </aside>
  )
}

