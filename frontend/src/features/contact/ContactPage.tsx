import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { useContactInfo, useStoreCenters } from '../../lib/hooks/useAboutUs'
import { ContactForm } from '../../components/ContactForm'
import { Button } from '../../components/Button'
import type { StoreCenter } from '../../lib/api/endpoints/content'

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

export function ContactPage() {
  const { data: contactInfo, isLoading: isLoadingContactInfo, isError: isErrorContactInfo } = useContactInfo()
  const { data: storeCenters, isLoading: isLoadingStoreCenters } = useStoreCenters()

  // Default fallback content for Contact Info
  const defaultContactInfo = {
    id: null,
    email: 'hello@dolcefiore.com',
    phone: '+91 1234567890',
    additional_info: '',
    opening_hours_monday: '6:00 AM - 8:00 PM',
    opening_hours_tuesday: '6:00 AM - 8:00 PM',
    opening_hours_wednesday: '6:00 AM - 8:00 PM',
    opening_hours_thursday: '6:00 AM - 8:00 PM',
    opening_hours_friday: '6:00 AM - 8:00 PM',
    opening_hours_saturday: '6:00 AM - 8:00 PM',
    opening_hours_sunday: '6:00 AM - 8:00 PM',
  }
  const contactInfoContent = (isErrorContactInfo || !contactInfo) ? defaultContactInfo : contactInfo

  // Check if all opening hours are the same
  const allHoursSame = contactInfoContent.opening_hours_monday === contactInfoContent.opening_hours_tuesday &&
    contactInfoContent.opening_hours_tuesday === contactInfoContent.opening_hours_wednesday &&
    contactInfoContent.opening_hours_wednesday === contactInfoContent.opening_hours_thursday &&
    contactInfoContent.opening_hours_thursday === contactInfoContent.opening_hours_friday &&
    contactInfoContent.opening_hours_friday === contactInfoContent.opening_hours_saturday &&
    contactInfoContent.opening_hours_saturday === contactInfoContent.opening_hours_sunday

  return (
    <div className="flex flex-col">
      <Container>
        <div className="pt-12 sm:pt-16 pb-12 sm:pb-16">
          <SectionTitle
            title="Get In Touch"
            subtitle="We'd love to hear from you"
            align="center"
          />
          
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Info Section */}
            <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
              <h3 className="text-2xl font-heading text-charcoal-900 mb-6">
                Contact Information
              </h3>
              {isLoadingContactInfo ? (
                <div className="space-y-6">
                  <div className="h-16 bg-beige-100 rounded animate-pulse"></div>
                  <div className="h-16 bg-beige-100 rounded animate-pulse"></div>
                  <div className="h-32 bg-beige-100 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gold-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-500 mb-1">Email</h4>
                      <a
                        href={`mailto:${contactInfoContent.email}`}
                        className="text-base text-charcoal-900 hover:text-gold-600 transition-colors"
                      >
                        {contactInfoContent.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gold-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-500 mb-1">Phone</h4>
                      <a
                        href={`tel:${contactInfoContent.phone.replace(/\s+/g, '')}`}
                        className="text-base text-charcoal-900 hover:text-gold-600 transition-colors"
                      >
                        {contactInfoContent.phone}
                      </a>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="pt-4 border-t border-beige-200">
                    <h4 className="text-sm font-medium text-charcoal-500 mb-3">Opening Hours</h4>
                    {allHoursSame ? (
                      <p className="text-base text-charcoal-900">
                        Monday - Sunday: {contactInfoContent.opening_hours_monday}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const hoursKey = `opening_hours_${day.key}` as keyof typeof contactInfoContent
                          const hours = contactInfoContent[hoursKey]
                          return (
                            <div key={day.key} className="flex justify-between">
                              <span className="text-base text-charcoal-700">{day.label}:</span>
                              <span className="text-base text-charcoal-900">{hours || 'Closed'}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Store Centers */}
                  {!isLoadingStoreCenters && storeCenters && storeCenters.length > 0 && (
                    <div className="pt-4 border-t border-beige-200">
                      <h4 className="text-sm font-medium text-charcoal-500 mb-3">Our Locations</h4>
                      <div className="space-y-4">
                        {storeCenters.map((center: StoreCenter) => (
                          <div key={center.id} className="bg-beige-50 rounded-lg p-4">
                            <h5 className="text-base font-medium text-charcoal-900 mb-2">
                              {center.name}
                            </h5>
                            <p className="text-sm text-charcoal-700 mb-3 leading-relaxed">
                              {center.address}
                            </p>
                            <a
                              href={center.google_map_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Button
                                variant="secondary"
                                className="w-full sm:w-auto text-sm py-2 px-4 min-h-[36px]"
                              >
                                View on Google Maps
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {contactInfoContent.additional_info && (
                    <div className="pt-4 border-t border-beige-200">
                      <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                        {contactInfoContent.additional_info}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connect Form Section */}
            <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
              <h3 className="text-2xl font-heading text-charcoal-900 mb-6">
                Send us a Message
              </h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

