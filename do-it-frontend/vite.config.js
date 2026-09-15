import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// DO-IT frontend build config.
// PWA plugin is configured here (not bolted on later) so installability
// and offline behavior are part of the app from Phase 1, per the blueprint.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'DO-IT',
        short_name: 'DO-IT',
        description: 'Plan, focus, move, reflect — one system for your whole day.',
        theme_color: '#1F2937',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache the app shell; API calls are network-first (handled per-request
        // later) rather than cached blindly, since task/study data must stay fresh.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173
  }
})