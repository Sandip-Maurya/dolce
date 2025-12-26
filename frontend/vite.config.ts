import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to Django backend
      // This makes API requests appear same-origin, so cookies work properly
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // Preserve the /api prefix when forwarding
        rewrite: (path) => path,
      },
    },
  },
})
