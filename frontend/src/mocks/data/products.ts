import { type Product } from '../../lib/api/endpoints/catalog'

// Premium Unsplash images for Dolce Fiore products
// Using editorial-quality images: gourmet desserts, artisanal sweets, organic snacks, eco-friendly packaging

export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'organic-chocolate-hamper',
    name: 'Organic Chocolate Gift Hamper',
    description:
      'A luxurious collection of handcrafted, organic dark chocolates made with premium cacao. Each piece is carefully crafted by local artisans, featuring unique flavors like sea salt caramel, orange zest, and cardamom. Wrapped in eco-friendly kraft paper with a reusable jute bag. Perfect for conscious gifting that delights the senses while supporting sustainable practices.',
    price: 2499,
    currency: 'INR',
    category: 'HAMPER',
    images: [
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['organic', 'artisan', 'eco-friendly', 'guilt-free'],
    is_available: true,
    weight_grams: 500,
  },
  {
    id: '2',
    slug: 'sugar-free-dessert-collection',
    name: 'Sugar-Free Dessert Collection',
    description:
      'Indulge guilt-free with our curated selection of sugar-free desserts. Featuring air-fried cookies, natural sweetener-based cakes, and artisanal treats. All ingredients are organic and locally sourced. Each item is handcrafted with care, ensuring premium quality and taste. Packaged in reusable glass jars and cloth bags.',
    price: 1899,
    currency: 'INR',
    category: 'SWEET',
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['sugar-free', 'organic', 'guilt-free', 'artisan'],
    is_available: true,
    weight_grams: 750,
  },
  {
    id: '3',
    slug: 'artisan-cookie-box',
    name: 'Artisan Cookie Box',
    description:
      'A premium collection of handcrafted cookies made with organic flour, natural sweeteners, and traditional recipes. Each cookie is baked fresh and features unique flavors like almond cardamom, coconut jaggery, and chocolate chip with dates. Presented in a beautiful wooden box with eco-friendly packaging.',
    price: 1299,
    currency: 'INR',
    category: 'COOKIE',
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['artisan', 'organic', 'eco-friendly'],
    is_available: true,
    weight_grams: 400,
  },
  {
    id: '4',
    slug: 'healthy-snack-hamper',
    name: 'Healthy Snack Hamper',
    description:
      'A thoughtfully curated hamper of air-fried savories and organic snacks. Features baked namkeen, roasted nuts, and traditional Indian snacks made with minimal oil and natural ingredients. All items are handcrafted by local artisans and packaged in reusable containers. Perfect for health-conscious individuals who love flavor.',
    price: 1599,
    currency: 'INR',
    category: 'HAMPER',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['organic', 'guilt-free', 'eco-friendly', 'artisan'],
    is_available: true,
    weight_grams: 600,
  },
  {
    id: '5',
    slug: 'premium-cake-collection',
    name: 'Premium Cake Collection',
    description:
      'Handcrafted cakes made with organic ingredients and natural sweeteners. Our collection includes classic flavors like vanilla bean, chocolate fudge, and lemon zest, all sugar-free and guilt-free. Each cake is baked fresh and decorated with edible flowers and natural garnishes. Presented in eco-friendly packaging.',
    price: 2199,
    currency: 'INR',
    category: 'CAKE',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['sugar-free', 'organic', 'artisan', 'guilt-free'],
    is_available: true,
    weight_grams: 1000,
  },
  {
    id: '6',
    slug: 'eco-luxury-gift-hamper',
    name: 'Eco Luxury Gift Hamper',
    description:
      'Our signature gift hamper featuring a premium selection of organic sweets, sugar-free chocolates, artisanal cookies, and air-fried savories. All items are handcrafted with care and packaged in sustainable materials including kraft paper, jute bags, and reusable glass containers. A perfect gift that celebrates conscious living and premium quality.',
    price: 3499,
    currency: 'INR',
    category: 'HAMPER',
    images: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['organic', 'eco-friendly', 'artisan', 'guilt-free'],
    is_available: true,
    weight_grams: 1500,
  },
  {
    id: '7',
    slug: 'artisan-sweet-box',
    name: 'Artisan Sweet Box',
    description:
      'A collection of traditional Indian sweets reimagined with organic ingredients and natural sweeteners. Features besan ladoo, coconut barfi, and date rolls, all made by skilled local artisans. Each sweet is handcrafted and wrapped in eco-friendly packaging. A perfect blend of tradition and conscious living.',
    price: 999,
    currency: 'INR',
    category: 'SWEET',
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['artisan', 'organic', 'guilt-free'],
    is_available: true,
    weight_grams: 500,
  },
  {
    id: '8',
    slug: 'gourmet-snack-box',
    name: 'Gourmet Snack Box',
    description:
      'A premium selection of air-fried and baked snacks made with organic ingredients. Features multigrain chips, spiced nuts, and traditional namkeen varieties. All snacks are prepared with minimal oil and natural seasonings. Packaged in reusable containers with eco-friendly materials.',
    price: 1199,
    currency: 'INR',
    category: 'SNACK',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80&auto=format&fit=crop',
    ],
    tags: ['organic', 'guilt-free', 'eco-friendly'],
    is_available: true,
    weight_grams: 450,
  },
]

