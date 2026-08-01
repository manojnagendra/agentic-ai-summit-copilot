import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { localApiPlugin } from './vite.local-api'

export default defineConfig({
  plugins: [
    localApiPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Agentic AI Summit CoPilot',
        short_name: 'Summit CoPilot',
        description: 'Personal agenda, venue guide, and note insights for Agentic AI Summit 2026.',
        theme_color: '#0f2a1f',
        background_color: '#0f2a1f',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5174,
  },
})
