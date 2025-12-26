# Dolce Fiore

> Premium, handcrafted gift hampers rooted in health, sustainability, and conscious living.

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Future Plans & Improvements](#future-plans--improvements)
- [Contributing](#contributing)
- [License](#license)

## About

**Dolce Fiore** is a premium e-commerce platform for handcrafted gift hampers that celebrate health, sustainability, and conscious living. Every product is designed to delight while leaving a positive impact on people and the planet.

### Brand Story

Dolce Fiore began as a homegrown venture with a simple dream — to craft thoughtful, sustainable gifting experiences. What started four years ago with a passion for healthy indulgence has grown into a celebration of creativity and conscious living.

Our hampers feature:
- **Organic, guilt-free treats** — Premium ingredients without compromise
- **Air-fried savories** — Healthier alternatives to traditional snacks
- **Sugar-free chocolates** — Indulgence without the guilt
- **Eco-friendly, reusable packaging** — Sustainable materials that become part of the gift

We proudly partner with local artisans across India, bringing tradition and sustainability into every creation.

### Design Philosophy

- **Premium • Minimal • Elegant • Conscious • Artisanal**
- Soft neutral palette (warm beige, off-white, deep brown/charcoal, muted gold)
- Sustainable textures (kraft paper, wood, marble, cotton, jute)
- Premium photography with natural light and editorial vibe
- Smooth, subtle animations

### Target Audience

Premium, health-conscious, eco-aware customers and luxury gift buyers who value quality, sustainability, and thoughtful gifting.

## Features

### ✅ Implemented Features

#### 🏠 Home Page
- **Hero Section** — Premium hero image with brand tagline and call-to-action buttons
- **Featured Hampers** — Curated showcase of premium gift hampers
- **Healthy Indulgences** — Sugar-free and guilt-free product highlights
- **Sustainable Gifting** — Dynamic content section with images, titles, and descriptions loaded from backend API
- **Testimonials** — Text-based and video-based customer testimonials dynamically loaded from backend API
- **Brand Story** — Narrative about Dolce Fiore's journey and values

#### ℹ️ About Us Page
- **About Us Section** — Company introduction with default fallback content
- **Our Story Section** — Brand history and journey with default fallback content
- **Our Commitment Section** — Sustainability and values content managed by backend
- **Photo Gallery** — Grid layout showcasing company photos with skeleton loaders
- **Blog Section** — Blog posts with images, dates, and content managed by backend
- **Testimonials** — Reuses testimonials from home page
- **Error Handling** — Comprehensive error handling with fallback content to prevent layout distortion
- **Skeleton Loaders** — Beautiful loading states for all sections

#### 🛍️ Product Catalog
- **Product Listing** — Responsive grid layout displaying all products
- **Advanced Filtering** — Filter by category (COOKIE, SNACK, CAKE, SWEET, HAMPER) and tags (organic, sugar-free, eco-friendly, artisan, guilt-free)
- **Search Functionality** — Real-time search across product names and descriptions
- **Sorting Options** — Sort by price (low to high, high to low) or newest first
- **Product Cards** — Beautiful cards with images, badges, pricing, and quick actions
- **Mobile-First Design** — Optimized filter sidebar for mobile devices with drawer navigation

#### 📦 Product Details
- **Product Information** — Comprehensive product details with images, description, and specifications
- **Product Tags** — Visual badges for organic, eco-friendly, sugar-free, and artisan products
- **Add to Cart** — Seamless cart integration with availability checking
- **Related Products** — Suggestions for similar items

#### 🛒 Shopping Cart
- **Cart Management** — Add, remove, and update item quantities
- **Real-time Totals** — Automatic calculation of subtotals and grand total
- **Item Details** — Product information, images, and line totals
- **Responsive Layout** — Stacked on mobile, side-by-side on desktop
- **Empty State** — Helpful messaging when cart is empty

#### 💳 Checkout Flow
- **Multi-Step Process** — Structured checkout with customer details, delivery preferences, and payment
- **Customer Information** — Name, email, and phone number collection
- **Shipping Address** — Complete address form with validation
- **Delivery Preferences** — Optional gift notes and delivery date selection
- **Payment Integration Structure** — Ready for Razorpay/Stripe integration
- **Order Summary** — Clear breakdown of items and totals

#### 📋 Order Management
- **Order History** — View all past orders with status tracking
- **Order Details** — Complete order information including items, totals, and shipping
- **Status Tracking** — Visual indicators for order status (PLACED, PAID, PROCESSING, SHIPPED, DELIVERED)
- **Order Confirmation** — Thank you page with order summary

#### 🔐 Authentication
- **User Login** — Secure login with email and password
- **User Signup** — Registration for new customers
- **User Profile** — Profile management page
- **Session Management** — Mock authentication system ready for backend integration

#### 🎨 User Interface
- **Responsive Design** — Mobile-first approach, fully responsive across all devices
- **Premium Design System** — Consistent typography (Playfair Display + Inter), colors, and spacing
- **Smooth Animations** — Subtle hover effects, transitions, and micro-interactions
- **Accessibility** — Keyboard navigation, ARIA labels, and semantic HTML
- **Toast Notifications** — User-friendly feedback for actions using React Hot Toast
- **Skeleton Loaders** — Beautiful shimmer animations during content loading (similar to Facebook/YouTube)
- **Scroll-to-Top Navigation** — Automatic scroll reset to top when navigating between pages

#### 🔧 Technical Features
- **Mock API Integration** — MSW (Mock Service Worker) for development
- **State Management** — Zustand for UI state, TanStack React Query for server state
- **Type Safety** — Full TypeScript implementation with strict typing
- **Code Organization** — Feature-based architecture for maintainability
- **Performance** — Optimized with lazy loading and efficient data fetching

## Technology Stack

### Core Framework
- **React 19.2.0** — Modern UI library with latest features
- **TypeScript 5.9.3** — Type-safe JavaScript for better developer experience
- **Vite 7.2.4** — Fast build tool and development server

### Routing & Navigation
- **React Router DOM 7.9.6** — Declarative routing for React applications

### State Management
- **TanStack React Query 5.90.11** — Powerful data synchronization and server state management
- **Zustand 5.0.8** — Lightweight state management for UI state

### Styling
- **Tailwind CSS 4.1.17** — Utility-first CSS framework
- **PostCSS 8.5.6** — CSS processing with autoprefixer

### API & Data
- **MSW 2.12.3** — Mock Service Worker for API mocking in development

### UI Components & Utilities
- **React Hot Toast 2.6.0** — Beautiful toast notifications

### Development Tools
- **ESLint 9.39.1** — Code linting and quality assurance
- **TypeScript ESLint 8.46.4** — TypeScript-specific linting rules

## Project Structure

```
dolce-v4/
├── public/                 # Static assets and MSW service worker
│   └── mockServiceWorker.js
├── src/
│   ├── app/               # Application root and routing
│   │   ├── App.tsx        # Main app component with providers
│   │   └── router.tsx     # Route definitions
│   ├── assets/            # Static assets (images, icons)
│   ├── components/        # Reusable UI components
│   │   ├── Badge.tsx      # Product tag badges
│   │   ├── Button.tsx     # Button component variants
│   │   ├── Card.tsx        # Card container component
│   │   ├── Container.tsx  # Layout container
│   │   ├── FilterSidebar.tsx  # Product filtering UI
│   │   ├── MainLayout.tsx  # App layout (header, footer)
│   │   ├── Modal.tsx       # Modal dialog component
│   │   ├── ScrollToTop.tsx # Scroll-to-top on route change
│   │   ├── SearchBar.tsx   # Search input component
│   │   ├── SectionTitle.tsx # Section heading component
│   │   ├── SkeletonLoader.tsx # Loading skeleton components
│   │   ├── SortDropdown.tsx # Sorting dropdown
│   │   ├── TextTestimonialCard.tsx # Text testimonial card component
│   │   └── VideoTestimonialCard.tsx # Video testimonial card component
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── cart/          # Shopping cart
│   │   │   └── CartPage.tsx
│   │   ├── checkout/      # Checkout flow
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderConfirmationPage.tsx
│   │   │   └── PaymentSection.tsx
│   │   ├── home/          # Home page
│   │   │   └── HomePage.tsx
│   │   ├── orders/        # Order management
│   │   │   └── OrdersPage.tsx
│   │   ├── products/      # Product pages
│   │   │   ├── ProductDetailPage.tsx
│   │   │   └── ProductsPage.tsx
│   │   └── profile/       # User profile
│   │       └── ProfilePage.tsx
│   ├── lib/               # Core libraries and utilities
│   │   ├── api/           # API client and endpoints
│   │   │   ├── client.ts  # Base API client
│   │   │   └── endpoints/ # API endpoint definitions
│   │   │       ├── auth.ts
│   │   │       ├── cart.ts
│   │   │       ├── catalog.ts
│   │   │       ├── content.ts
│   │   │       ├── orders.ts
│   │   │       └── payments.ts
│   │   ├── config/        # Configuration files
│   │   │   └── env.ts     # Environment variables
│   │   └── hooks/         # Custom React hooks
│   │       ├── useAuth.ts
│   │       ├── useCart.ts
│   │       ├── useOrders.ts
│   │       ├── useProducts.ts
│   │       ├── useSustainableGifting.ts
│   │       └── useTestimonials.ts
│   ├── mocks/             # Mock data and API handlers
│   │   ├── browser.ts     # MSW browser setup
│   │   ├── handlers.ts    # API request handlers
│   │   └── data/          # Mock data
│   │       ├── cart.ts
│   │       ├── orders.ts
│   │       └── products.ts
│   ├── styles/            # Global styles
│   ├── index.css          # Main stylesheet
│   └── main.tsx           # Application entry point
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
└── vite.config.ts         # Vite configuration
```

### Architecture Principles

- **Feature-Based Organization** — Code is organized by features (products, cart, orders) rather than by file type
- **Separation of Concerns** — Clear separation between UI components, business logic, and data fetching
- **Reusable Components** — Shared components in `components/` directory
- **API Abstraction** — All API calls go through centralized client and endpoint files
- **Type Safety** — Full TypeScript coverage with strict typing
- **Mock-First Development** — MSW enables frontend development without backend dependency

## Getting Started

### Prerequisites

- **Node.js** — Version 18.0.0 or higher
- **npm** or **yarn** — Package manager
- **Git** — Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dolce-v4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - The app will automatically reload when you make changes

### Environment Setup

Currently, the application uses MSW (Mock Service Worker) for API mocking. No environment variables are required for development.

For production deployment with a real backend:

1. Create a `.env` file in the root directory
2. Add your API base URL:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Available Scripts

- `npm run dev` — Start development server with hot module replacement
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint to check code quality

### Code Organization

- **Components** — Keep components small, focused, and reusable
- **Hooks** — Custom hooks for data fetching and business logic
- **API Layer** — All API calls through `lib/api/` for easy backend integration
- **Types** — TypeScript interfaces defined alongside their usage

### API Mocking

The application uses **MSW (Mock Service Worker)** for API mocking during development:

- Mock handlers are defined in `src/mocks/handlers.ts`
- Mock data is stored in `src/mocks/data/`
- MSW intercepts API requests and returns mock responses
- To disable MSW, remove the initialization in `src/main.tsx`

### Styling Guidelines

- **Mobile-First** — All styles default to mobile, then scale up
- **Tailwind Utilities** — Use Tailwind classes for styling
- **Custom Colors** — Brand colors defined in `tailwind.config.js`
- **Responsive Breakpoints** — Use `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes

### Skeleton Loaders

The application uses **SkeletonLoader** components to provide smooth loading experiences similar to Facebook and YouTube. These components display animated placeholders while content is being fetched from the API.

#### Features

- **Shimmer Animation** — Smooth left-to-right shimmer effect during loading
- **Multiple Types** — Support for card, text, image, and custom skeleton types
- **Pre-built Components** — Ready-to-use `SkeletonCard`, `SkeletonProductGrid`, and `SkeletonText` components
- **Consistent Design** — Matches the app's design system with beige color palette
- **Automatic Footer Hiding** — Footer is hidden during loading to keep focus on main content

#### Usage

```tsx
import { SkeletonProductGrid, SkeletonCard } from '../../components/SkeletonLoader'

// Show skeleton grid while loading
{isLoading ? (
  <SkeletonProductGrid count={6} />
) : (
  <ProductGrid products={products} />
)}
```

The skeleton loaders automatically appear when React Query detects that data is being fetched, providing users with visual feedback that content is loading.

### Scroll-to-Top Navigation

The application automatically scrolls to the top of the page whenever users navigate to a new route. This ensures a consistent user experience across all devices (desktop, tablet, mobile).

#### Behavior

- **Automatic Reset** — Scroll position resets to top (0, 0) on every route change
- **Instant Scroll** — No animation delay for immediate feedback
- **Works Everywhere** — Applies to all navigation methods:
  - Clicking navigation links (Home, Products, Orders, etc.)
  - Clicking the home logo (Dolce Fiore)
  - Programmatic navigation
  - Browser back/forward buttons

#### Implementation

The `ScrollToTop` component is integrated into `MainLayout`, ensuring it works for all routes automatically. It uses React Router's `useLocation` hook to detect route changes and scrolls the window to the top instantly.

### Navigation Bar

The application features a consistent navigation bar across all screens with the following structure:

#### Navigation Links

- **Home** — Links to the home page (`/`)
- **Products** — Links to the product catalog (`/products`)
- **About Us** — Links to the About Us page (`/about`)
- **Orders** — Links to order history (`/orders`)
- **Cart** — Shopping cart icon with item count badge (links to `/cart`)
- **Login/Signup** — Authentication links (shown when user is not logged in)
- **User Menu** — Profile dropdown menu (shown when user is logged in)

#### Navigation Features

- **Logo Link** — The "Dolce Fiore" logo on the left side of the navigation bar also links to the home page (`/`)
- **Active State** — Current page is highlighted with an underline (desktop) or left border (mobile)
- **Responsive Design** — Desktop shows all links horizontally; mobile uses a hamburger menu
- **Cart Badge** — Displays the total number of items in the cart
- **User Menu** — Dropdown menu with profile link and logout option when authenticated

## API Documentation

The application currently uses mock APIs via MSW. All endpoints are prefixed with `/api`.

### Products

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": "product-1",
    "slug": "organic-chocolate-hamper",
    "name": "Organic Chocolate Hamper",
    "description": "Premium organic chocolates...",
    "price": 2999,
    "currency": "INR",
    "category": "HAMPER",
    "images": ["https://..."],
    "tags": ["organic", "eco-friendly"],
    "is_available": true,
    "weight_grams": 500
  }
]
```

#### Get Product by Slug
```http
GET /api/products/:slug
```

**Response:** Single product object (same structure as above)

### Cart

#### Get Cart
```http
GET /api/cart
```

**Response:**
```json
{
  "items": [
    {
      "id": "cart-item-1",
      "product": { /* Product object */ },
      "quantity": 2,
      "line_total": 5998
    }
  ],
  "total": 5998
}
```

#### Add to Cart
```http
POST /api/cart
Content-Type: application/json

{
  "productId": "product-1",
  "quantity": 1
}
```

#### Update Cart Item Quantity
```http
PUT /api/cart/:id
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/:id
```

### Orders

#### Get Orders
```http
GET /api/orders
```

**Response:**
```json
[
  {
    "id": "order-1",
    "items": [ /* CartItem array */ ],
    "total": 5998,
    "status": "PLACED",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-1",
      "quantity": 2
    }
  ],
  "customerDetails": {
    "name": "Sandip Maurya",
    "email": "sandip@example.com",
    "phone": "+91 1234567890"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "deliveryPreferences": {
    "giftNote": "Happy Birthday!",
    "deliveryDate": "2024-01-20"
  }
}
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sandip@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "user-1",
  "email": "sandip@example.com",
  "name": "User"
}
```

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "sandip@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Payments

#### Create Payment Order
```http
POST /api/payments/create-order
Content-Type: application/json

{
  "amount": 5998,
  "currency": "INR",
  "orderId": "order-1"
}
```

**Response:**
```json
{
  "paymentOrderId": "payment-order-123",
  "provider": "RAZORPAY",
  "amount": 5998,
  "currency": "INR"
}
```

### Content

#### Get Sustainable Gifting Items
```http
GET /api/content/sustainable-gifting/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Reusable Materials",
    "description": "Every hamper is thoughtfully wrapped...",
    "image_url": "https://images.unsplash.com/...",
    "order": 0,
    "is_active": true
  },
  {
    "id": "uuid",
    "title": "Conscious Living",
    "description": "We partner with local artisans...",
    "image_url": "https://images.unsplash.com/...",
    "order": 1,
    "is_active": true
  }
]
```

This endpoint returns active sustainable gifting items ordered by their `order` field. The frontend uses this data to dynamically display the Sustainable Gifting section on the home page.

#### Get Text Testimonials
```http
GET /api/content/testimonials/text/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "text": "Amazing products! Highly recommend.",
    "rating": 5,
    "location": "Mumbai, India",
    "image_url": "https://images.unsplash.com/...",
    "order": 0
  }
]
```

#### Get Video Testimonials
```http
GET /api/content/testimonials/video/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Jane Smith",
    "text": "Love the sustainable packaging!",
    "video_url": "https://www.youtube.com/embed/...",
    "rating": 5,
    "location": "Delhi, India",
    "image_url": "https://images.unsplash.com/...",
    "order": 0
  }
]
```

These endpoints return active testimonials ordered by their `order` field. The frontend displays text testimonials in a card grid and video testimonials with embedded YouTube/Vimeo videos.

#### Get About Us Section
```http
GET /api/content/about-us/
```

**Response:**
```json
{
  "id": "uuid",
  "title": "About Us",
  "content": "At Dolce Fiore, we are passionate about...",
  "order": 0,
  "is_active": true
}
```

Returns the active About Us section. If no active section exists, returns default fallback content.

#### Get Our Story Section
```http
GET /api/content/our-story/
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Our Story",
  "content": "Dolce Fiore began as a homegrown venture...",
  "order": 0,
  "is_active": true
}
```

Returns the active Our Story section. If no active section exists, returns default fallback content.

#### Get Our Commitment Sections
```http
GET /api/content/our-commitment/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Sustainability",
    "content": "We are committed to...",
    "order": 0,
    "is_active": true
  }
]
```

Returns all active Our Commitment sections ordered by their `order` field.

#### Get Photo Gallery Items
```http
GET /api/content/photo-gallery/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Workshop Photo",
    "image_url": "https://images.unsplash.com/...",
    "order": 0,
    "is_active": true
  }
]
```

Returns all active photo gallery items ordered by their `order` field.

#### Get Blog Posts
```http
GET /api/content/blogs/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Sustainable Packaging Tips",
    "content": "In this blog post, we explore...",
    "image_url": "https://images.unsplash.com/...",
    "published_date": "2024-01-15",
    "order": 0,
    "is_active": true
  }
]
```

Returns all active blog posts ordered by published date (newest first), then by `order` field.

## Future Plans & Improvements

### 🔄 Backend Integration

- [ ] **Django REST API Integration** — Connect to real Django backend
- [ ] **Database Integration** — PostgreSQL database for products, orders, and users
- [ ] **Image Storage** — Migrate from Unsplash to CDN/object storage (S3, Cloudflare R2)
- [ ] **Environment Configuration** — Production environment variables setup
- [ ] **API Authentication** — JWT token-based authentication
- [ ] **Error Handling** — Comprehensive error handling and user feedback

### 💳 Payment Gateway

- [ ] **Razorpay Integration** — Full payment gateway integration for Indian market
- [ ] **Stripe Integration** — Alternative payment gateway for international customers
- [ ] **Payment Status Tracking** — Real-time payment status updates
- [ ] **Refund Management** — Automated refund processing
- [ ] **Payment Security** — PCI compliance and secure payment handling

### 🚀 Advanced Features

- [ ] **Wishlist Functionality** — Save favorite products for later
- [ ] **Product Reviews & Ratings** — Customer feedback system
- [ ] **Recommendation Engine** — AI-powered product recommendations
- [ ] **Gift Wrapping Options** — Customizable gift wrapping services
- [ ] **Subscription Boxes** — Recurring gift hamper subscriptions
- [ ] **Loyalty Program** — Rewards and points system
- [ ] **Referral Program** — Customer referral incentives

### 📱 User Experience

- [ ] **Advanced Search** — Full-text search with filters
- [ ] **Product Comparison** — Side-by-side product comparison
- [ ] **Quick View** — Modal product preview without leaving page
- [ ] **Recently Viewed** — Track and display recently viewed products
- [ ] **Save for Later** — Move cart items to wishlist
- [ ] **Guest Checkout** — Allow checkout without account creation
- [ ] **Address Book** — Save multiple shipping addresses

### ⚡ Performance Optimizations

- [ ] **Image Optimization** — WebP format, lazy loading, responsive images
- [ ] **Code Splitting** — Route-based code splitting for faster initial load
- [ ] **Caching Strategy** — Implement service worker for offline support
- [ ] **Bundle Size Optimization** — Tree shaking and dead code elimination
- [ ] **CDN Integration** — Serve static assets via CDN
- [ ] **Database Query Optimization** — Efficient data fetching and pagination

### 🧪 Testing

- [ ] **Unit Tests** — Jest + React Testing Library for components
- [ ] **Integration Tests** — Test user flows and API interactions
- [ ] **E2E Tests** — Playwright or Cypress for end-to-end testing
- [ ] **Visual Regression Testing** — Ensure UI consistency
- [ ] **Performance Testing** — Lighthouse CI and performance budgets

### 🔍 SEO & Analytics

- [ ] **SEO Optimization** — Meta tags, structured data, sitemap
- [ ] **Google Analytics** — User behavior tracking
- [ ] **Search Console** — Monitor search performance
- [ ] **Social Media Integration** — Open Graph and Twitter Card tags
- [ ] **Blog Section** — Content marketing for SEO

### 📊 Admin Dashboard

- [ ] **Admin Panel** — Management interface for products, orders, users
- [ ] **Inventory Management** — Stock tracking and alerts
- [ ] **Order Management** — Status updates, shipping labels
- [ ] **Analytics Dashboard** — Sales, revenue, and customer insights
- [ ] **Content Management** — Easy content updates without code

### 🌐 Internationalization

- [ ] **Multi-Language Support** — i18n for multiple languages
- [ ] **Currency Conversion** — Support for multiple currencies
- [ ] **Regional Pricing** — Location-based pricing
- [ ] **Localized Content** — Region-specific product descriptions

### 🔒 Security & Compliance

- [ ] **HTTPS Enforcement** — SSL/TLS certificates
- [ ] **Data Privacy** — GDPR compliance and privacy policy
- [ ] **Rate Limiting** — API rate limiting to prevent abuse
- [ ] **Input Validation** — Server-side validation
- [ ] **Security Headers** — CSP, XSS protection
- [ ] **Regular Security Audits** — Dependency vulnerability scanning

### 📧 Marketing & Communication

- [ ] **Email Notifications** — Order confirmations, shipping updates
- [ ] **Newsletter System** — Email marketing integration
- [ ] **Abandoned Cart Recovery** — Automated email reminders
- [ ] **SMS Notifications** — Order updates via SMS
- [ ] **Push Notifications** — Browser push notifications for updates

### 🎨 Design Enhancements

- [ ] **Dark Mode** — Theme switching capability
- [ ] **Animation Library** — Framer Motion for advanced animations
- [ ] **Accessibility Improvements** — WCAG 2.1 AA compliance
- [ ] **Print Styles** — Optimized styles for order printing
- [ ] **PWA Features** — Progressive Web App capabilities

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow code style** — Use ESLint and Prettier
3. **Write tests** — Ensure new features have test coverage
4. **Update documentation** — Keep README and code comments up to date
5. **Submit a pull request** — Describe your changes clearly

### Development Guidelines

- Follow the existing code structure and patterns
- Maintain TypeScript strict mode compliance
- Ensure mobile-first responsive design
- Keep components small and focused
- Write meaningful commit messages

## License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ in India**

For questions or support, please contact the development team.
