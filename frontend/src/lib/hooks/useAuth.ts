import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, type LoginCredentials, type SignupData, type User, type UpdateProfileData } from '../api/endpoints/auth'

export const userKeys = {
  current: () => ['user'] as const,
}

/**
 * Hook to get the current user.
 * Automatically fetches user from /auth/me/ endpoint on mount if not in cache.
 * For Django session auth, the user is authenticated via cookies.
 */
export function useUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401 errors
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (user: User) => {
      // Store user in query cache for easy access
      queryClient.setQueryData(userKeys.current(), user)
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignupData) => authApi.signup(data),
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.current(), user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear user data on logout
      queryClient.removeQueries({ queryKey: userKeys.current() })
      // Clear other user-specific data
      queryClient.removeQueries({ queryKey: ['orders'] })
      queryClient.removeQueries({ queryKey: ['cart'] })
      queryClient.removeQueries({ queryKey: ['profile'] })
    },
  })
}

export const profileKeys = {
  current: () => ['profile'] as const,
}

/**
 * Hook to fetch the current user's profile.
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to update the user's profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileData) => authApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update profile in cache
      queryClient.setQueryData(profileKeys.current(), updatedProfile)
    },
  })
}

