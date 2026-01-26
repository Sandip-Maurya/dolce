'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Container } from './Container'
import { useCart } from '../lib/hooks/useCart'
import { useUser, useLogout } from '../lib/hooks/useAuth'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const menuRef = useRef<HTMLElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const menuJustOpenedRef = useRef(false)
  
  const { data: cart } = useCart()
  const { data: user } = useUser()
  const logoutMutation = useLogout()
  
  // Calculate total cart item count from cart items
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/orders', label: 'Orders' },
  ]

  const isActive = (path: string) => pathname === path

  // Handle menu toggle
  const handleMenuToggle = () => {
    if (!isMobileMenuOpen) {
      menuJustOpenedRef.current = true
      setIsMobileMenuOpen(true)
      setTimeout(() => {
        menuJustOpenedRef.current = false
      }, 300)
    } else {
      menuJustOpenedRef.current = false
      setIsMobileMenuOpen(false)
    }
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
        menuJustOpenedRef.current = false
      }
    }

    if (isMobileMenuOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMobileMenuOpen])

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsUserMenuOpen(false)
        router.push('/')
      },
    })
  }

  return (
    <header className="bg-white border-b border-beige-200 sticky top-0 z-40">
      <Container>
        <nav ref={menuRef} className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-heading text-charcoal-900 hover:text-charcoal-700 transition-colors"
          >
            Dolce Fiore
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`text-sm lg:text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-charcoal-900 border-b-2 border-charcoal-900'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart Icon with Badge */}
            <Link
              href="/cart"
              className="relative text-charcoal-600 hover:text-charcoal-900 transition-colors"
              aria-label="Shopping cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu or Login/Signup Links */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm lg:text-base font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors"
                >
                  <span className="hidden sm:inline">{user.name || user.email}</span>
                  <span className="sm:hidden">{user.name?.charAt(0) || user.email.charAt(0)}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
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
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-beige-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-beige-200">
                      <p className="text-sm font-medium text-charcoal-900">{user.name}</p>
                      <p className="text-xs text-charcoal-600 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-beige-50 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm text-charcoal-700 hover:bg-beige-50 transition-colors disabled:opacity-50"
                    >
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`text-sm lg:text-base font-medium transition-colors ${
                    isActive('/auth/login')
                      ? 'text-charcoal-900 border-b-2 border-charcoal-900'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className={`text-sm lg:text-base font-medium transition-colors ${
                    isActive('/auth/signup')
                      ? 'text-charcoal-900 border-b-2 border-charcoal-900'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Cart Icon for Mobile */}
            <Link
              href="/cart"
              className="relative text-charcoal-600 hover:text-charcoal-900 transition-colors"
              aria-label="Shopping cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={handleMenuToggle}
              className={`relative w-6 h-6 flex flex-col justify-center items-center text-charcoal-600 hover:text-charcoal-900 focus:outline-none border-0 bg-transparent rounded p-1 transition-colors active:scale-95 ${
                isMobileMenuOpen
                  ? 'focus-visible:ring-2 focus-visible:ring-charcoal-500'
                  : ''
              }`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`absolute w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen
                    ? 'rotate-45 translate-y-0'
                    : '-translate-y-2'
                }`}
              />
              <span
                className={`absolute w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              />
              <span
                className={`absolute w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen
                    ? '-rotate-45 translate-y-0'
                    : 'translate-y-2'
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden border-t border-beige-200 overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-96 opacity-100 py-4'
              : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors py-2 ${
                  isActive(link.to)
                    ? 'text-charcoal-900 border-l-4 border-charcoal-900 pl-4'
                    : 'text-charcoal-600 hover:text-charcoal-900 pl-4'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-4 py-2 border-t border-beige-200 mt-2 pt-4">
                  <p className="text-sm font-medium text-charcoal-900">{user.name}</p>
                  <p className="text-xs text-charcoal-600 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-2 ${
                    isActive('/profile')
                      ? 'text-charcoal-900 border-l-4 border-charcoal-900 pl-4'
                      : 'text-charcoal-600 hover:text-charcoal-900 pl-4'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  disabled={logoutMutation.isPending}
                  className="w-full text-left text-base font-medium transition-colors py-2 text-charcoal-600 hover:text-charcoal-900 pl-4 disabled:opacity-50"
                >
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-2 ${
                    isActive('/auth/login')
                      ? 'text-charcoal-900 border-l-4 border-charcoal-900 pl-4'
                      : 'text-charcoal-600 hover:text-charcoal-900 pl-4'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-2 ${
                    isActive('/auth/signup')
                      ? 'text-charcoal-900 border-l-4 border-charcoal-900 pl-4'
                      : 'text-charcoal-600 hover:text-charcoal-900 pl-4'
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
