import { config } from '../config/env'

/**
 * Custom error class for API errors with status code and message
 */
export class ApiError extends Error {
  public status: number
  public data?: unknown

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrftoken') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Fetch CSRF token from Django by making a GET request
 */
async function fetchCsrfToken(baseUrl: string): Promise<string | null> {
  try {
    // Make a GET request to get the CSRF token cookie
    await fetch(`${baseUrl}/schema/`, {
      method: 'GET',
      credentials: 'include',
    })
    
    // The CSRF token should now be in cookies
    return getCsrfToken()
  } catch {
    return null
  }
}

class ApiClient {
  private baseUrl: string
  private csrfTokenPromise: Promise<string | null> | null = null

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  /**
   * Parse Django REST Framework error response
   */
  private parseErrorResponse(response: Response, data: unknown): string {
    // Django REST Framework error formats:
    // 1. { error: "Error message" }
    // 2. { field: ["Error message"] }
    // 3. { field: ["Error 1", "Error 2"] }
    // 4. { detail: "Error message" }
    
    if (typeof data === 'object' && data !== null) {
      const errorObj = data as Record<string, unknown>
      
      // Check for simple error message
      if ('error' in errorObj && typeof errorObj.error === 'string') {
        return errorObj.error
      }
      
      // Check for detail field
      if ('detail' in errorObj && typeof errorObj.detail === 'string') {
        return errorObj.detail
      }
      
      // Check for field-specific errors
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
    
    // Fallback to status text
    return response.statusText || `HTTP ${response.status} Error`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Get CSRF token for state-changing requests
    let csrfToken = getCsrfToken()
    const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || '')
    
    // If we need CSRF token but don't have it, try to fetch it
    if (needsCsrf && !csrfToken && !this.csrfTokenPromise) {
      this.csrfTokenPromise = fetchCsrfToken(this.baseUrl)
      csrfToken = await this.csrfTokenPromise
      this.csrfTokenPromise = null
    } else if (needsCsrf && !csrfToken && this.csrfTokenPromise) {
      // Wait for ongoing CSRF token fetch
      csrfToken = await this.csrfTokenPromise
      this.csrfTokenPromise = null
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    
    // Add CSRF token if available and needed for POST/PUT/DELETE
    if (csrfToken && needsCsrf) {
      headers['X-CSRFToken'] = csrfToken
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for session authentication
        headers,
      })

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204 || response.status === 201 && response.headers.get('content-length') === '0') {
        return {} as T
      }

      // Parse JSON response
      let data: unknown
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          // If JSON parsing fails, use status text
          data = null
        }
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const errorMessage = this.parseErrorResponse(response, data)
        
        // Handle specific status codes
        if (response.status === 401) {
          // Unauthorized - clear any cached user data
          throw new ApiError('Authentication required. Please log in.', 401, data)
        } else if (response.status === 403) {
          throw new ApiError('You do not have permission to perform this action.', 403, data)
        } else if (response.status === 404) {
          throw new ApiError('The requested resource was not found.', 404, data)
        } else if (response.status >= 500) {
          throw new ApiError('Server error. Please try again later.', response.status, data)
        } else {
          throw new ApiError(errorMessage, response.status, data)
        }
      }

      return data as T
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your connection.', 0, error)
      }
      
      // Re-throw other errors
      throw error
    }
  }

  async get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
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
    return this.request<T>(url, { method: 'GET' })
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

