import { useState } from 'react'
import { Button } from './Button'
import { useContactForm } from '../lib/hooks/useContact'
import { type ContactFormData } from '../lib/api/endpoints/content'
import toast from 'react-hot-toast'

export function ContactForm() {
  const contactMutation = useContactForm()
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Name must be at most 200 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.phone && formData.phone.trim().length > 20) {
      newErrors.phone = 'Phone number must be at most 20 characters'
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be at most 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    contactMutation.mutate(
      {
        ...formData,
        phone: formData.phone?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Thank you for contacting us! We will get back to you soon.')
          // Clear form
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: 'general',
            message: '',
          })
          setErrors({})
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to send message. Please try again.'
          toast.error(errorMessage)
        },
      }
    )
  }

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.name ? 'border-red-500' : 'border-beige-300'
          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
          placeholder="Your name"
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.email ? 'border-red-500' : 'border-beige-300'
          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
          placeholder="your.email@example.com"
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-2">
          Phone Number <span className="text-charcoal-400 text-xs">(optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.phone ? 'border-red-500' : 'border-beige-300'
          } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
          placeholder="+91 1234567890"
        />
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-charcoal-700 mb-2">
          Subject *
        </label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value as ContactFormData['subject'])}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.subject ? 'border-red-500' : 'border-beige-300'
          } focus:outline-none focus:ring-2 focus:ring-charcoal-500 bg-white`}
        >
          <option value="general">General Inquiry</option>
          <option value="product">Product Question</option>
          <option value="order">Order Support</option>
          <option value="partnership">Partnership</option>
          <option value="other">Other</option>
        </select>
        {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-charcoal-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={6}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.message ? 'border-red-500' : 'border-beige-300'
          } focus:outline-none focus:ring-2 focus:ring-charcoal-500 resize-none`}
          placeholder="Tell us how we can help you..."
        />
        {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={contactMutation.isPending}
        disabled={contactMutation.isPending}
      >
        Send Message
      </Button>
    </form>
  )
}

