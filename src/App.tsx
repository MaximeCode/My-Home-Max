import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { todoStorage } from '@/storage'
import { useNotifications } from '@/hooks/useNotifications'

/**
 * À chaque ouverture de l'app, re-planifie toutes les notifications
 * des tâches actives dont la date est dans le futur.
 *
 * Couvre les cas où le SW a été réinitialisé (mise à jour, redémarrage
 * du téléphone) et les notifications TimestampTrigger ont été perdues.
 */
function useReschedulePendingNotifications() {
  const { isGranted, scheduleTaskNotification } = useNotifications()

  useEffect(() => {
    if (!isGranted()) return

    const tasks = todoStorage.getTasks()
    const now = new Date()

    for (const task of tasks) {
      if (task.status === 'done') continue
      if (!task.dueDate) continue

      // Reconstruire la date cible
      const [year, month, day] = task.dueDate.split('-').map(Number)
      const [hour, minute] = task.dueTime
        ? task.dueTime.split(':').map(Number)
        : [8, 0]
      const targetDate = new Date(year, month - 1, day, hour, minute, 0, 0)

      if (targetDate <= now) continue

      // Re-planifier (si déjà planifiée, cancelTaskNotification est appelé
      // en interne dans scheduleTaskNotification avant de re-créer)
      void scheduleTaskNotification(task.id, task.title, task.dueDate, task.dueTime)
    }
  // On ne veut ce re-schedule qu'au montage initial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function AppContent() {
  useReschedulePendingNotifications()
  return <RouterProvider router={router} />
}

export function App() {
  return <AppContent />
}
