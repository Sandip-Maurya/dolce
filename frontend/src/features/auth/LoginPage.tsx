import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { useLogin } from '../../lib/hooks/useAuth'
import { authApi, type Profile } from '../../lib/api/endpoints/auth'

/**
 * Check if a profile is fully complete.
 * A profile is considered complete if it has:
 * - Phone number
 * - Complete shipping address (street, city, state, zipCode)
 */
function isProfileFullyComplete(profile: Profile): boolean {
  // Check if phone is provided
  if (!profile.phone || profile.phone.trim() === '') {
    return false
  }

  // Check if shipping address is complete
  const address = profile.shippingAddress
  if (
    !address ||
    !address.street?.trim() ||
    !address.city?.trim() ||
    !address.state?.trim() ||
    !address.zipCode?.trim()
  ) {
    return false
  }

  return true
}

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    loginMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: async () => {
          // Check if profile is complete
          try {
            const profile = await authApi.getProfile()
            const isProfileComplete = isProfileFullyComplete(profile)
            navigate(isProfileComplete ? '/products' : '/profile')
          } catch {
            // If profile fetch fails, redirect to profile page
            navigate('/profile')
          }
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed. Please try again.'
          setErrors({ submit: errorMessage })
        },
      }
    )
  }

  return (
    <Container>
      <div className="py-12">
        <div className="max-w-md mx-auto">
          <SectionTitle
            title="Welcome Back"
            subtitle="Sign in to your account"
            align="center"
          />

          <div className="mt-8 bg-white rounded-xl shadow-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-beige-300'
                  } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                  placeholder="sandip@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-charcoal-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-beige-300'
                  } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="text-charcoal-900 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
