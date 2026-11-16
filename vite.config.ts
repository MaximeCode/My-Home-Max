import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // injectManifest : on fournit notre propre SW (src/sw.ts)
      // qui combine Workbox précache + logique de notifications
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false, // On gère l'enregistrement dans main.tsx

      manifest: {
        name: 'My Home Max',
        short_name: 'MaxTools',
        description: 'Budget, to-do list et courses — pour téléphone',
        lang: 'fr',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      injectManifest: {
        // Fichiers à précacher dans le SW
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },

      devOptions: {
        // Activer le SW en mode dev pour tester les notifications
        enabled: false,
        type: 'module',
      },
    }),
  ],
})
