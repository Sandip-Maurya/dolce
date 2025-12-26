import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { SectionTitle } from '../../components/SectionTitle'
import { Button } from '../../components/Button'
import { useSignup } from '../../lib/hooks/useAuth'

export function SignupPage() {
  const navigate = useNavigate()
  const signupMutation = useSignup()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    signupMutation.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      },
      {
        onSuccess: () => {
          navigate('/profile')
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Sign up failed. Please try again.'
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
            title="Create Account"
            subtitle="Join Dolce Fiore for premium gifting"
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
                <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-beige-300'
                  } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                  placeholder="Sandip Maurya"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-charcoal-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-beige-300'
                  } focus:outline-none focus:ring-2 focus:ring-charcoal-500`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={signupMutation.isPending}
                disabled={signupMutation.isPending}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-charcoal-900 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
