'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'
import { SectionTitle } from '@/components/SectionTitle'
import type { FAQ as FAQType } from '@/lib/api/endpoints/content'
import { defaultFAQs } from '@/lib/defaults/homepage'
import { cn } from '@/lib/utils'

interface FAQSectionProps {
  items: FAQType[]
}

export function FAQSection({ items }: FAQSectionProps) {
  const list = items.length > 0 ? items : defaultFAQs
  const [openId, setOpenId] = useState<string | number | null>(null)

  return (
    <Container>
      <SectionTitle
        title="Frequently Asked Questions"
        subtitle="Quick answers about our hampers, delivery, and gifting"
        align="center"
      />
      <div className="max-w-3xl mx-auto space-y-2">
        {list.map((faq, i) => {
          const id: string | number =
            typeof (faq as FAQType).id === 'string' ? (faq as FAQType).id : i
          const isOpen = openId === id
          return (
            <div
              key={String(id)}
              className="border border-beige-200 rounded-xl overflow-hidden bg-white shadow-soft"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium text-charcoal-900 hover:bg-beige-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <span
                  className={cn(
                    'flex-shrink-0 text-gold-600 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-0 text-charcoal-700 text-sm sm:text-base leading-relaxed border-t border-beige-100">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}
