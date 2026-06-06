import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'framer-motion', 'sweetalert2', 'react-toastify'],
          charts: ['recharts'],
          pdf: ['@react-pdf/renderer', 'jspdf', 'jspdf-autotable']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api/payables': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // No rewrite — backend serves /api/payables/ directly
      },
      '/api/procurement': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // No rewrite — backend serves /api/procurement/ directly
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/?/, '/api/v1/')
      },
      '/workforce': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
