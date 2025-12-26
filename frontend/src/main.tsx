import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { config } from './lib/config/env'

// Initialize MSW conditionally
async function enableMocking() {
  // Only enable MSW if:
  // 1. In development mode AND
  // 2. VITE_USE_MOCK_API is explicitly set to 'true'
  // This allows testing with real backend by not setting the env var
  if (import.meta.env.MODE !== 'development' || !config.useMockApi) {
    return
  }

  const { worker } = await import('./mocks/browser')
  
  // Start the worker and wait for it to be ready
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
  
  console.log('MSW (Mock Service Worker) enabled. Set VITE_USE_MOCK_API=false to use real backend.')
}

// Wait for MSW to be ready before rendering the app
enableMocking()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Failed to start MSW:', error)
    // Still render the app even if MSW fails
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
