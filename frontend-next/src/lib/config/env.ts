/**
 * Get the API base URL.
 * Server-side: Needs absolute URL (internal docker service or localhost).
 * Client-side (browser): Must use relative '/api' so requests go to same origin
 * (e.g. https://www.kakshaonline.com/api/...) and CloudFront/Lightsail route them.
 * NEXT_PUBLIC_API_URL is inlined at build time (no window), so we must use a
 * runtime check for browser to avoid requests to http://backend:8000 (ERR_NAME_NOT_RESOLVED).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api';
}


export const config = {
  apiBaseUrl: getApiBaseUrl(),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
}
