import { useState, useRef, useEffect } from 'react'

type SortOption = 'price-low' | 'price-high' | 'newest'

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export function SortDropdown({ value, onChange, className = '' }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-beige-300 bg-white text-charcoal-900 hover:border-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all min-w-[180px] justify-between shadow-soft hover:shadow-card"
        aria-label="Sort products"
        aria-expanded={isOpen}
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
            <path d="M3 6h18M7 12h10M11 18h2"></path>
          </svg>
          <span className="text-sm font-medium">{selectedOption.label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-charcoal-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-card border border-beige-200 overflow-hidden transition-all duration-200">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                value === option.value
                  ? 'bg-beige-100 text-charcoal-900'
                  : 'text-charcoal-700 hover:bg-beige-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

