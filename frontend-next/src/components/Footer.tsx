'use client'

import Link from 'next/link'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-beige-100 mt-auto relative">
      <Container>
        {/* Decorative Top Accent Line */}
        <div className="flex items-center justify-center pt-12 sm:pt-16 pb-8 opacity-60">
          <div className="h-px w-16 bg-gold-300"></div>
          <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gold-300"></div>
          <div className="h-px w-16 bg-gold-300"></div>
        </div>

        <div className="pb-12 sm:pb-16">
          {/* Main Footer Content */}
          <div className="flex flex-row justify-center md:justify-around items-start gap-3 sm:gap-6 md:gap-12 lg:gap-16 mb-12 max-w-5xl mx-auto">
            {/* Quick Links */}
            <div className="text-left min-w-0">
              <h4 className="text-sm sm:text-base md:text-lg font-heading mb-3 sm:mb-4 md:mb-5 text-beige-50">Quick Links</h4>
              <div className="h-px w-6 sm:w-8 bg-gold-300/30 mb-3 sm:mb-4"></div>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
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
                  <Link
                    href="/about"
                    className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-beige-300 hover:text-gold-300 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    Privacy Policy
                  </Link>
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
                {/* Other social links truncated for brevity */}
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
  )
}
