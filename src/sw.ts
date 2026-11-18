/**
 * Service Worker custom — MaxTools
 *
 * Stratégie `injectManifest` de vite-plugin-pwa :
 *   - `self.__WB_MANIFEST` est injecté par Workbox au build
 *   - Workbox gère le précache des assets statiques
 *   - Ce fichier gère le fallback setTimeout pour les notifications
 *     (quand TimestampTrigger n'est pas supporté)
 *   - Les notifications TimestampTrigger sont planifiées directement
 *     depuis useNotifications.ts via registration.showNotification()
 *     et ne passent pas par ce SW.
 */

/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/vanillajs" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope

// ─── Workbox précache ─────────────────────────────────────────────────────────

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ─── Notifications — fallback setTimeout ─────────────────────────────────────
// Utilisé uniquement quand TimestampTrigger n'est pas disponible dans le navigateur.

interface SchedulePayload {
  taskId: string
  title: string
  body: string
  delay: number
}

interface CancelPayload {
  taskId: string
}

type SWMessage =
  | { type: 'SCHEDULE_NOTIFICATION'; payload: SchedulePayload }
  | { type: 'CANCEL_NOTIFICATION'; payload: CancelPayload }

const scheduledTimers = new Map<string, ReturnType<typeof setTimeout>>()

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const message = event.data as SWMessage | undefined
  if (!message) return

  if (message.type === 'SCHEDULE_NOTIFICATION') {
    const { taskId, title, body, delay } = message.payload

    const existing = scheduledTimers.get(taskId)
    if (existing !== undefined) clearTimeout(existing)

    const timerId = setTimeout(() => {
      const options: NotificationOptions & { renotify?: boolean } = {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `task-${taskId}`,
        renotify: true,
        data: { taskId, url: '/todo' },
      }
      void self.registration.showNotification(title, options)
      scheduledTimers.delete(taskId)
    }, delay)

    scheduledTimers.set(taskId, timerId)
  }

  if (message.type === 'CANCEL_NOTIFICATION') {
    const { taskId } = message.payload
    const existing = scheduledTimers.get(taskId)
    if (existing !== undefined) {
      clearTimeout(existing)
      scheduledTimers.delete(taskId)
    }
  }
})

// ─── Clic sur une notification → ouvre /todo ─────────────────────────────────

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) =>
          c.url.startsWith(self.location.origin),
        )
        if (existing) {
          void existing.focus()
          void existing.navigate('/todo')
        } else {
          void self.clients.openWindow('/todo')
        }
      }),
  )
})
