import { config, getApiBaseUrl } from '../config/env'

export class ApiError extends Error {
  public status: number
  public data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrftoken') {
      return decodeURIComponent(value)
    }
  }
  return null
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  private parseErrorResponse(response: Response, data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const errorObj = data as Record<string, unknown>
      
      if ('error' in errorObj && typeof errorObj.error === 'string') {
        return errorObj.error
      }
      
      if ('detail' in errorObj && typeof errorObj.detail === 'string') {
        return errorObj.detail
      }
      
      const fieldErrors: string[] = []
      for (const [field, errors] of Object.entries(errorObj)) {
        if (Array.isArray(errors)) {
          fieldErrors.push(`${field}: ${errors.join(', ')}`)
        } else if (typeof errors === 'string') {
          fieldErrors.push(`${field}: ${errors}`)
        }
      }
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ')
      }
    }
    
    return response.statusText || `HTTP ${response.status} Error`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    
    // Server-side logic
    if (typeof window === 'undefined') {
      try {
        // Dynamic import to avoid bundling server-only modules in client
        // This relies on Next.js/Webpack ignoring this branch in client bundle
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const cookieString = cookieStore.toString()
        if (cookieString) {
          headers['Cookie'] = cookieString
        }
      } catch {
        // Ignore errors (e.g. if module not found or outside request context)
      }
    } else {
      // Client-side logic
      options.credentials = 'include' // Cookies for auth
      
      // CSRF for unsafe methods
      const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || '')
      if (needsCsrf) {
        const csrfToken = getCsrfToken()
        if (csrfToken) {
          headers['X-CSRFToken'] = csrfToken
        }
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return {} as T
    }

    let data: unknown
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch {
        data = null
      }
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const errorMessage = this.parseErrorResponse(response, data)
      throw new ApiError(errorMessage, response.status, data)
    }

    return data as T
  }

  async get<T>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | undefined>,
    fetchOptions?: RequestInit
  ): Promise<T> {
    let url = endpoint
    if (queryParams) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      }
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET', ...fetchOptions })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
