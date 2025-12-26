/**
 * Get the API base URL.
 * In development with Vite proxy: Use relative path (same-origin)
 * In production: Use full URL from environment variable
 */
function getApiBaseUrl(): string {
  // allow explicit override via env variable (for production)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // in development, use relative path so Vite proxy handles it
  if (import.meta.env.DEV) {
    return '/api';
  }

  // default for production: relative path behind nginx
  return '/api';
}


export const config = {
  // In development: Uses Vite proxy (same-origin, cookies work)
  // In production: Uses VITE_API_BASE_URL environment variable
  apiBaseUrl: getApiBaseUrl(),
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
}

