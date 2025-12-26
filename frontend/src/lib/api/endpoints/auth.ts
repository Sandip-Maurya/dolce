import { apiClient } from '../client'

export interface User {
  id: string
  email: string
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Profile {
  name: string
  email: string
  phone: string
  shippingAddress: ShippingAddress
}

export interface UpdateProfileData {
  phone?: string
  shippingAddress?: ShippingAddress
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<User>('/auth/login/', credentials),
  logout: () => apiClient.post('/auth/logout/'),
  signup: (data: SignupData) =>
    apiClient.post<User>('/auth/signup/', data),
  getCurrentUser: () => apiClient.get<User>('/auth/me/'),
  getProfile: () => apiClient.get<Profile>('/auth/profile/'),
  updateProfile: (data: UpdateProfileData) =>
    apiClient.put<Profile>('/auth/profile/', data),
}

