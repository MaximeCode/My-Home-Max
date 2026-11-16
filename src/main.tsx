import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { App } from './App'

// Enregistrement du Service Worker PWA (généré par vite-plugin-pwa)
// autoUpdate: true → le SW se met à jour silencieusement en arrière-plan
registerSW({
  onNeedRefresh() {
    // Mise à jour disponible — on recharge automatiquement
    // (l'utilisateur n'a pas à le faire manuellement)
  },
  onOfflineReady() {
    console.log('[PWA] App prête pour une utilisation hors-ligne')
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    // Enregistrer aussi le SW de notifications custom
    // Note : le SW Workbox généré par vite-plugin-pwa gère le cache ;
    // sw-notifications.js est importé via customSW dans vite.config pour
    // y ajouter la logique de notifications (voir vite.config.ts)
    console.log('[PWA] SW enregistré :', swUrl)
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Element #root introuvable')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
