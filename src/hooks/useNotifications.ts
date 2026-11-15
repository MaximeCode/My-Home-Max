import { useCallback } from 'react'
import { settingsStorage } from '@/storage'

/**
 * Gère la permission de notification et le scheduling via le Service Worker.
 *
 * Règle métier :
 * - Si une tâche a une dueTime → notification à l'heure exacte (HH:mm) du jour J.
 * - Si pas de dueTime         → notification à 08:00 le matin du jour J.
 */

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

  /**
   * Planifie une notification pour une tâche via le Service Worker.
   * Envoie un message au SW avec le timestamp cible ; le SW se charge
   * de déclencher la notification au bon moment.
   */
  const scheduleTaskNotification = useCallback(
    async (taskId: string, title: string, dueDate: string, dueTime: string | null) => {
      if (!isGranted()) return

      const targetDate = buildNotificationDate(dueDate, dueTime)
      const now = new Date()

      // On ne planifie que si la date est dans le futur
      if (targetDate <= now) return

      const delay = targetDate.getTime() - now.getTime()

      const registration = await navigator.serviceWorker.ready

      // On transmet les infos au SW via postMessage
      registration.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: {
          taskId,
          title,
          body: dueTime
            ? `Prévu à ${dueTime}`
            : `Prévu aujourd'hui`,
          delay,
        },
      })
    },
    [isGranted],
  )

  /**
   * Annule la notification d'une tâche (ex. tâche terminée ou supprimée).
   */
  const cancelTaskNotification = useCallback(async (taskId: string) => {
    if (!('serviceWorker' in navigator)) return

    const registration = await navigator.serviceWorker.ready
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
