import { useCallback } from 'react'
import { settingsStorage } from '@/storage'

/**
 * Gère la permission de notification et le scheduling.
 *
 * Stratégie de scheduling (par ordre de priorité) :
 *
 * 1. `TimestampTrigger` (Chrome Android 80+, PWA installée) :
 *    Planifie la notification directement dans l'OS via l'API
 *    Notification Triggers. Le SW n'a pas besoin d'être actif au moment
 *    du déclenchement. C'est la seule façon d'avoir des notifs en
 *    arrière-plan sans serveur push.
 *
 * 2. `postMessage → setTimeout` (fallback) :
 *    Utilisé si TimestampTrigger n'est pas disponible. Ne fonctionne
 *    que si le SW reste actif, donc uniquement quand l'app est ouverte.
 *
 * Règle métier :
 * - Si une tâche a une dueTime → notification à l'heure exacte (HH:mm) du jour J.
 * - Si pas de dueTime          → notification à 08:00 le matin du jour J.
 */

// Typage de l'API expérimentale Notification Triggers (pas dans les types TS standard)
interface TimestampTrigger {
  readonly timestamp: number
}
declare const TimestampTrigger: {
  new (timestamp: number): TimestampTrigger
}

interface NotificationOptionsWithTrigger extends NotificationOptions {
  showTrigger?: TimestampTrigger
  renotify?: boolean
}

function isTimestampTriggerSupported(): boolean {
  return typeof window !== 'undefined' && 'TimestampTrigger' in window
}

function buildNotificationDate(dueDate: string, dueTime: string | null): Date {
  const [year, month, day] = dueDate.split('-').map(Number)
  const [hour, minute] = dueTime ? dueTime.split(':').map(Number) : [8, 0]
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false

    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'

    const settings = settingsStorage.get()
    settingsStorage.set({ ...settings, notificationsGranted: granted })

    return granted
  }, [])

  const isSupported = useCallback((): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator
  }, [])

  const isGranted = useCallback((): boolean => {
    return 'Notification' in window && Notification.permission === 'granted'
  }, [])

  const scheduleTaskNotification = useCallback(
    async (taskId: string, title: string, dueDate: string, dueTime: string | null) => {
      if (!isGranted()) return

      const targetDate = buildNotificationDate(dueDate, dueTime)
      const now = new Date()
      if (targetDate <= now) return

      const registration = await navigator.serviceWorker.ready
      const body = dueTime ? `Prévu à ${dueTime}` : `Prévu aujourd'hui`

      if (isTimestampTriggerSupported()) {
        // ── Stratégie 1 : TimestampTrigger (arrière-plan, OS-level) ──────────
        // Annuler d'abord toute notif déjà planifiée pour cette tâche
        const pending = await registration.getNotifications({
          tag: `task-${taskId}`,
          includeTriggered: true,
        } as GetNotificationOptions & { includeTriggered: boolean })
        pending.forEach((n) => n.close())

        const options: NotificationOptionsWithTrigger = {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `task-${taskId}`,
          renotify: true,
          data: { taskId, url: '/todo' },
          showTrigger: new TimestampTrigger(targetDate.getTime()),
        }

        await registration.showNotification(title, options as NotificationOptions)
      } else {
        // ── Stratégie 2 : postMessage → setTimeout dans le SW (fallback) ──
        const delay = targetDate.getTime() - now.getTime()
        registration.active?.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          payload: { taskId, title, body, delay },
        })
      }
    },
    [isGranted],
  )

  const cancelTaskNotification = useCallback(async (taskId: string) => {
    if (!('serviceWorker' in navigator)) return

    const registration = await navigator.serviceWorker.ready

    // Annuler les notifs TimestampTrigger en attente
    const pending = await registration.getNotifications({
      tag: `task-${taskId}`,
      includeTriggered: true,
    } as GetNotificationOptions & { includeTriggered: boolean })
    pending.forEach((n) => n.close())

    // Annuler aussi les setTimeout côté SW (fallback)
    registration.active?.postMessage({
      type: 'CANCEL_NOTIFICATION',
      payload: { taskId },
    })
  }, [])

  return {
    isSupported,
    isGranted,
    requestPermission,
    scheduleTaskNotification,
    cancelTaskNotification,
  }
}
