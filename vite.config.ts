import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { stripeCheckoutPlugin } from './vite/stripeCheckoutPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env keys (including STRIPE_SECRET_KEY — never exposed to the browser).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), stripeCheckoutPlugin(env)],
    server: {
      // Listen on all local interfaces so both localhost and 127.0.0.1 work
      // (Cursor/embedded browsers often hit localhost → different loopback path).
      host: true,
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) {
                return 'vendor-react'
              }
              if (id.includes('framer-motion')) return 'vendor-motion'
              if (id.includes('@supabase') || id.includes('@tanstack')) return 'vendor-data'
            }
            return undefined
          },
        },
      },
    },
  }
})
