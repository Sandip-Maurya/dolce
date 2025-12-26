import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { router } from './router'
import { ApiError } from '../lib/api/client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) errors
        if (error instanceof ApiError && error.status === 401) {
          return false
        }
        // Retry once for other errors
        return failureCount < 1
      },
      // Note: onError was removed from queries in React Query v5
      // Handle query errors in individual queries or use global error handler
    },
    mutations: {
      onError: (error: unknown) => {
        // Handle 401 errors in mutations
        if (error instanceof ApiError && error.status === 401) {
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/auth/')) {
            queryClient.removeQueries({ queryKey: ['user'] })
            window.location.href = '/auth/login'
          }
        } else if (error instanceof ApiError) {
          // Show error toast for other API errors
          toast.error(error.message || 'An error occurred')
        } else if (error instanceof Error) {
          toast.error(error.message || 'An error occurred')
        }
      },
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#f5f5f0',
            border: '1px solid #d4af37',
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#1a1a1a',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App

