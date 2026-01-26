/**
 * Get the API base URL.
 * Server-side: Needs absolute URL (internal docker service or localhost)
 * Client-side: Uses relative path '/api' which is handled by Next.js rewrites
 */
function getApiBaseUrl(): string {
  // Server-side
  if (typeof window === 'undefined') {
    // Prefer internal docker network URL if set
    if (process.env.INTERNAL_API_URL) {
      return process.env.INTERNAL_API_URL;
    }
    // Fallback to NEXT_PUBLIC_API_URL or default
    // If running in docker-compose, backend is at http://backend:8000/api
    return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api';
  }

  // Client-side: use relative path so Next.js proxy handles it
  return '/api';
}


export const config = {
  apiBaseUrl: getApiBaseUrl(),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
}
