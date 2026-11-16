import type { Task, TaskGroup } from '@/types'

// ─── Formulaire tâche ─────────────────────────────────────────────────────────

export interface TaskFormValues {
  title: string
  description: string
  groupId: string
  status: Task['status']
  priority: Task['priority']
  dueDate: string   // YYYY-MM-DD ou ''
  dueTime: string   // HH:mm ou ''
}

// ─── Formulaire groupe ────────────────────────────────────────────────────────

export interface GroupFormValues {
  name: string
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { Task, TaskGroup }
