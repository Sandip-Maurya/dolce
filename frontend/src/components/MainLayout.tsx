import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useIsFetching } from '@tanstack/react-query'
import { Container } from './Container'
import { ScrollToTop } from './ScrollToTop'
import { useCart } from '../lib/hooks/useCart'
import { useUser, useLogout } from '../lib/hooks/useAuth'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const menuJustOpenedRef = useRef(false)
  const { data: cart } = useCart()
  const { data: user } = useUser()
  const logoutMutation = useLogout()
  
  // Detect if any queries are currently fetching
  const isFetching = useIsFetching()
  const isLoading = isFetching > 0

  // Calculate total cart item count from cart items
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About Us' },
    { to: '/orders', label: 'Orders' },
  ]

  const isActive = (path: string) => location.pathname === path

  // Handle menu toggle with flag to prevent immediate closure
  const handleMenuToggle = () => {
    if (!isMobileMenuOpen) {
      // Menu is opening - set flag to prevent immediate closure
      menuJustOpenedRef.current = true
      setIsMobileMenuOpen(true)
      // Reset the flag after a delay to allow scroll handler to work normally
      setTimeout(() => {
        menuJustOpenedRef.current = false
      }, 300)
    } else {
      // Menu is closing - reset flag
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
      // Use a small delay to prevent immediate closure when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMobileMenuOpen])

  // Close menu on scroll (only if menu wasn't just opened)
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen && !menuJustOpenedRef.current) {
        setIsMobileMenuOpen(false)
        menuJustOpenedRef.current = false
      }
    }

    if (isMobileMenuOpen) {
      // Add a small delay before enabling scroll handler
      const timeoutId = setTimeout(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
      }, 300)

      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('scroll', handleScroll)
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
        navigate('/')
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <header className="bg-white border-b border-beige-200 sticky top-0 z-40">
        <Container>
          <nav ref={menuRef} className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl sm:text-2xl font-heading text-charcoal-900 hover:text-charcoal-700 transition-colors"
            >
              Dolce Fiore
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
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
                to="/cart"
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
                        to="/profile"
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
                    to="/auth/login"
                    className={`text-sm lg:text-base font-medium transition-colors ${
                      isActive('/auth/login')
                        ? 'text-charcoal-900 border-b-2 border-charcoal-900'
                        : 'text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/signup"
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
                to="/cart"
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
                  to={link.to}
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
                    to="/profile"
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
                    to="/auth/login"
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
                    to="/auth/signup"
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

      <main className={`flex-grow ${isLoading ? 'min-h-[60vh]' : ''}`}>{children}</main>

      {!isLoading && (
        <footer className="bg-charcoal-900 text-beige-100 mt-auto relative">
        <Container>
          {/* Decorative Top Accent Line */}
          <div className="flex items-center justify-center pt-12 sm:pt-16 pb-8 opacity-60">
            <div className="h-px w-16 bg-gold-300"></div>
            <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gold-300"></div>
            <div className="h-px w-16 bg-gold-300"></div>
          </div>

          <div className="pb-12 sm:pb-16">
            {/* Newsletter Section */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <div className="max-w-2xl mx-auto">
                <div className="backdrop-blur-sm bg-charcoal-800/50 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gold-300/20 shadow-2xl relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading mb-3 text-beige-50">
                      Stay Connected
                    </h3>
                    <p className="text-sm sm:text-base text-beige-300 leading-relaxed">
                      Subscribe to our newsletter for exclusive offers, new arrivals, and sustainable living tips.
                    </p>
                  </div>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      // Newsletter subscription logic would go here
                      setNewsletterEmail('')
                    }}
                    className="flex flex-col sm:flex-row gap-3 relative z-10"
                  >
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-lg bg-charcoal-900/50 border border-beige-300/20 text-beige-100 placeholder-beige-400 focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/50 transition-all relative z-10"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-charcoal-900 font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Main Footer Content */}
            <div className="flex flex-row justify-center md:justify-around items-start gap-3 sm:gap-6 md:gap-12 lg:gap-16 mb-12 max-w-5xl mx-auto">
              {/* Quick Links */}
              <div className="text-left min-w-0">
                <h4 className="text-sm sm:text-base md:text-lg font-heading mb-3 sm:mb-4 md:mb-5 text-beige-50">Quick Links</h4>
                <div className="h-px w-6 sm:w-8 bg-gold-300/30 mb-3 sm:mb-4"></div>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li>
                    <Link
                      to="/products"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div className="text-left min-w-0">
                <h4 className="text-sm sm:text-base md:text-lg font-heading mb-3 sm:mb-4 md:mb-5 text-beige-50">Company</h4>
                <div className="h-px w-6 sm:w-8 bg-gold-300/30 mb-3 sm:mb-4"></div>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Follow Us Section */}
              <div className="text-left min-w-0">
                <h4 className="text-sm sm:text-base md:text-lg font-heading mb-3 sm:mb-4 md:mb-5 text-beige-50">Follow Us</h4>
                <div className="h-px w-6 sm:w-8 bg-gold-300/30 mb-3 sm:mb-4"></div>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 sm:gap-3 text-beige-300 hover:text-[#E4405F] transition-colors duration-300 hover:translate-x-1"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
                        fill="#E4405F"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 sm:gap-3 text-beige-300 hover:text-[#0077B5] transition-colors duration-300 hover:translate-x-1"
                      aria-label="LinkedIn"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
                        fill="#0077B5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 sm:gap-3 text-beige-300 hover:text-[#FF0000] transition-colors duration-300 hover:translate-x-1"
                      aria-label="YouTube"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
                        fill="#FF0000"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span>YouTube</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 sm:gap-3 text-beige-300 hover:text-[#000000] transition-colors duration-300 hover:translate-x-1"
                      aria-label="X (Twitter)"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
                        fill="#000000"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>X (Twitter)</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="pt-8 border-t border-charcoal-800">
              <div className="flex flex-col md:flex-row justify-evenly items-center gap-4 sm:gap-6">
                <p className="text-sm text-beige-400">
                  © {new Date().getFullYear()} Dolce Fiore. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-beige-400 text-sm">
                  <span>Crafted with</span>
                  <svg
                    className="w-4 h-4 text-gold-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>in India</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
      )}
    </div>
  )
}

