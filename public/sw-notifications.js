/**
 * Service Worker — scheduling des notifications de tâches My Home Max.
 *
 * Le SW reçoit des messages de type :
 *   SCHEDULE_NOTIFICATION  → planifie une notification via setTimeout
 *   CANCEL_NOTIFICATION    → annule une notification planifiée
 *
 * Les timers sont stockés dans une Map en mémoire ; ils sont perdus
 * si le SW est tué (comportement normal — pas de persistance SW côté timer).
 * Pour les délais courts (< 5 min), cela fonctionne très bien sur Android.
 */

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const scheduledTimers = new Map()

self.addEventListener('message', (event) => {
  const { type, payload } = event.data ?? {}

  if (type === 'SCHEDULE_NOTIFICATION') {
    const { taskId, title, body, delay } = payload

    // Annuler un éventuel timer existant pour cette tâche
    if (scheduledTimers.has(taskId)) {
      clearTimeout(scheduledTimers.get(taskId))
    }

    const timerId = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `task-${taskId}`,
        renotify: true,
        data: { taskId },
      })
      scheduledTimers.delete(taskId)
    }, delay)

    scheduledTimers.set(taskId, timerId)
  }

  if (type === 'CANCEL_NOTIFICATION') {
    const { taskId } = payload

    if (scheduledTimers.has(taskId)) {
      clearTimeout(scheduledTimers.get(taskId))
      scheduledTimers.delete(taskId)
    }
  }
})

// Clic sur une notification → ouvre/focus l'app sur la page to-do
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url.includes(self.location.origin))
        if (existing) {
          existing.focus()
          existing.navigate('/todo')
        } else {
          self.clients.openWindow('/todo')
        }
      }),
  )
})
