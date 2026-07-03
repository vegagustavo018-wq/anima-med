import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5175,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        // Precache só a casca (leve). O conteúdo de estudo (/blocos/**) é
        // cacheado sob demanda por runtimeCaching — precachear 8600 JSONs seria ~40MB.
        globPatterns: ['**/*.{js,css,html,woff2,svg}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Blocos de conteúdo + manifesto: servem offline e revalidam em background.
            urlPattern: ({ url }) => url.pathname.startsWith('/blocos/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'anima-blocos',
              expiration: { maxEntries: 12000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imagens/esquemas dos blocos (SVG autoral + geradas): offline.
            urlPattern: ({ url }) => url.pathname.startsWith('/imagens/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'anima-imagens',
              expiration: { maxEntries: 4000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Banco de Questões (MCQ + flashcards): offline + revalida em background.
            urlPattern: ({ url }) => url.pathname.startsWith('/questoes/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'anima-questoes',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Fontes do Google (self-host viria depois): cache longo, offline.
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://fonts.googleapis.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'anima-fontes',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'ANIMA Med',
        short_name: 'ANIMA',
        description: 'Organismo vivo de estudo médico.',
        lang: 'pt-BR',
        dir: 'ltr',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@med': resolve(__dirname, './src/med'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/zustand')) return 'state'
          if (id.includes('node_modules/dexie')) return 'db'
          if (id.includes('node_modules/marked') || id.includes('node_modules/dompurify')) return 'render'
        },
      },
    },
  },
})
