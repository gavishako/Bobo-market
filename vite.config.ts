import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tailwindcss(),
    react(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'vendor-react'
          }

          if (
            id.includes('/@tanstack/react-router/') ||
            id.includes('/@tanstack/router-core/') ||
            id.includes('/@tanstack/history/') ||
            id.includes('/@tanstack/react-query/')
          ) {
            return 'vendor-tanstack'
          }

          if (id.includes('/@supabase/')) {
            return 'vendor-supabase'
          }

          if (id.includes('/recharts/') || id.includes('/d3-')) {
            return 'vendor-charts'
          }

          if (id.includes('/date-fns/')) {
            return 'vendor-date'
          }

          if (
            id.includes('/@radix-ui/') ||
            id.includes('/lucide-react/') ||
            id.includes('/embla-carousel-') ||
            id.includes('/react-hook-form/') ||
            id.includes('/zod/') ||
            id.includes('/vaul/')
          ) {
            return 'vendor-ui'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
})
