import { useState, useEffect } from 'react'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { useProfile, useUpdateProfile } from '../../lib/hooks/useAuth'
import { useUser } from '../../lib/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { UpdateProfileData } from '../../lib/api/endpoints/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { data: user } = useUser()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const [formData, setFormData] = useState({
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !profileLoading) {
      navigate('/auth/login')
    }
  }, [user, profileLoading, navigate])

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        shippingAddress: {
          street: profile.shippingAddress?.street || '',
          city: profile.shippingAddress?.city || '',
          state: profile.shippingAddress?.state || '',
          zipCode: profile.shippingAddress?.zipCode || '',
          country: profile.shippingAddress?.country || 'India',
        },
      })
    }
  }, [profile])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)'
    }

    if (formData.shippingAddress.street && !formData.shippingAddress.city.trim()) {
      newErrors.city = 'City is required when address is provided'
    }

    if (formData.shippingAddress.street && !formData.shippingAddress.state.trim()) {
      newErrors.state = 'State is required when address is provided'
    }

    if (formData.shippingAddress.street && !formData.shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required when address is provided'
    } else if (
      formData.shippingAddress.zipCode &&
      !/^[0-9]{6}$/.test(formData.shippingAddress.zipCode)
    ) {
      newErrors.zipCode = 'Invalid ZIP code (6 digits required)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    const updateData: UpdateProfileData = {
      phone: formData.phone || undefined,
      shippingAddress: formData.shippingAddress.street
        ? {
            street: formData.shippingAddress.street,
            city: formData.shippingAddress.city,
            state: formData.shippingAddress.state,
            zipCode: formData.shippingAddress.zipCode,
            country: formData.shippingAddress.country,
          }
        : undefined,
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Profile updated successfully')
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update profile')
      },
    })
  }

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (profileLoading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center text-charcoal-600">Loading profile...</div>
        </div>
      </Container>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <Container>
      <div className="py-12">
        <SectionTitle title="Profile" align="center" />
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-xl shadow-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h2 className="text-xl font-heading text-charcoal-900 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={user.name}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 bg-beige-50 text-charcoal-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-charcoal-500 mt-1">Name cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile?.email || user.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 bg-beige-50 text-charcoal-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-charcoal-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="10-digit phone number"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.phone ? 'border-red-500' : 'border-beige-300'
                      } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="border-t border-beige-200 pt-6">
                <h2 className="text-xl font-heading text-charcoal-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-charcoal-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleChange('shippingAddress.street', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-charcoal-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleChange('shippingAddress.city', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.city ? 'border-red-500' : 'border-beige-300'
                        } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-charcoal-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleChange('shippingAddress.state', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.state ? 'border-red-500' : 'border-beige-300'
                        } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-charcoal-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) =>
                          handleChange('shippingAddress.zipCode', e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.zipCode ? 'border-red-500' : 'border-beige-300'
                        } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-charcoal-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={formData.shippingAddress.country}
                        onChange={(e) => handleChange('shippingAddress.country', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-beige-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-beige-200">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Container>
  )
}

