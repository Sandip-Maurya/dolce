import type { HeroSection, TrustBarItem, FAQ, CorporateGiftingSection, BrandStorySection } from '@/lib/api/endpoints/content'

export const defaultHero: Omit<HeroSection, 'id' | 'is_active'> & { id?: string; is_active?: boolean } = {
  headline: 'Gifting that feels premium',
  highlight_text: 'and leaves a lighter footprint',
  subheadline:
    'Handcrafted hampers with organic, guilt-free treats and reusable packaging — made for conscious celebrations.',
  primary_cta_text: 'Shop Hampers',
  primary_cta_link: '/products',
  secondary_cta_text: 'Our Story',
  secondary_cta_link: '/about',
  background_image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1920&q=80&auto=format&fit=crop',
}

export const defaultTrustBarItems: Omit<TrustBarItem, 'id'>[] = [
  { icon_name: 'truck', text: 'Ships in 24–48 hours', order: 0, is_active: true },
  { icon_name: 'gift', text: 'Gift note + schedule delivery', order: 1, is_active: true },
  { icon_name: 'leaf', text: 'Small-batch, handcrafted', order: 2, is_active: true },
  { icon_name: 'heart', text: 'Sugar-free options', order: 3, is_active: true },
  { icon_name: 'package', text: 'Reusable, eco packaging', order: 4, is_active: true },
  { icon_name: 'users', text: 'Bulk & corporate orders', order: 5, is_active: true },
]

export const defaultFAQs: Omit<FAQ, 'id'>[] = [
  {
    question: 'What is the shelf life of your products?',
    answer:
      'Most of our treats have a shelf life of 4–8 weeks when stored in a cool, dry place. Specific dates are mentioned on each product and hamper.',
    order: 0,
    is_active: true,
  },
  {
    question: 'Do you offer sugar-free and guilt-free options?',
    answer:
      'Yes. We have a dedicated range of sugar-free chocolates, air-fried savories, and organic treats that are perfect for health-conscious gifting.',
    order: 1,
    is_active: true,
  },
  {
    question: 'Can I schedule delivery for a specific date?',
    answer:
      'Yes. At checkout you can add a preferred delivery date and a gift note. We pack and ship so your gift arrives when you need it.',
    order: 2,
    is_active: true,
  },
  {
    question: 'Do you do corporate or bulk orders?',
    answer:
      'Yes. We offer custom hampers, branding, and bulk pricing for corporate gifting. Use the "Request a quote" or Contact form to get in touch.',
    order: 3,
    is_active: true,
  },
  {
    question: 'What is your return or replacement policy?',
    answer:
      'We want you to be delighted. If something arrives damaged or not as described, contact us within 48 hours and we will replace or refund as appropriate.',
    order: 4,
    is_active: true,
  },
  {
    question: 'Is the packaging really reusable?',
    answer:
      'Yes. We use kraft paper, jute bags, and glass or reusable containers wherever possible so the packaging becomes part of the gift.',
    order: 5,
    is_active: true,
  },
]

export const defaultCorporateGifting: Omit<CorporateGiftingSection, 'id' | 'is_active'> & {
  id?: string
  is_active?: boolean
} = {
  title: 'Corporate & Bulk Gifting',
  description:
    'Impress clients and teams with custom hampers, branded packaging, and scheduled deliveries. We handle bulk orders with the same care as every gift.',
  features: [
    'Bulk orders with volume pricing',
    'Custom branding and packaging',
    'Scheduled delivery across India',
    'Dedicated support for large orders',
  ],
  primary_cta_text: 'Request a quote',
  primary_cta_link: '/contact',
  secondary_cta_text: 'WhatsApp us',
  secondary_cta_link: 'https://wa.me/919876543210',
  background_image_url: '',
}

export const defaultBrandStory: Omit<BrandStorySection, 'id' | 'is_active'> & {
  id?: string
  is_active?: boolean
} = {
  title: 'Why Dolce Fiore',
  subtitle: 'Health-first indulgence, artisan-made, and packaging that becomes part of the gift.',
  features: [
    'Health-first indulgence — sugar-free and guilt-free without compromise',
    'Artisan-made with local partners across India',
    "Reusable, eco packaging that's part of the gift",
  ],
  cta_text: 'Read the full story',
  cta_link: '/about',
}
