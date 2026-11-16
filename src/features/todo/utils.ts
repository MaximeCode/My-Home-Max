import type { Task, TaskGroup } from '@/types'
import { sortByOrder } from '@/utils'

// ─── Libellés ─────────────────────────────────────────────────────────────────

export const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Faible',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
}

export const PRIORITY_ORDER: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'À faire',
  'in-progress': 'En cours',
  done: 'Terminé',
}

// ─── Tri des tâches dans un groupe ────────────────────────────────────────────

/**
 * Trie : d'abord par priorité décroissante, puis par date limite croissante,
 * puis par ordre manuel.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority]
    const pb = PRIORITY_ORDER[b.priority]
    if (pa !== pb) return pa - pb

    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return a.order - b.order
  })
}

// ─── Groupes triés ────────────────────────────────────────────────────────────

export function sortedGroups(groups: TaskGroup[]): TaskGroup[] {
  return sortByOrder(groups)
}

// ─── Tâches par groupe ────────────────────────────────────────────────────────

export function tasksByGroup(tasks: Task[], groupId: string): Task[] {
  return sortTasks(tasks.filter((t) => t.groupId === groupId && t.status !== 'done'))
}

export function doneTasksByGroup(tasks: Task[], groupId: string): Task[] {
  return tasks.filter((t) => t.groupId === groupId && t.status === 'done')
}

// ─── Vérification date limite ─────────────────────────────────────────────────

export function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dueDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  return due < today
}

export function isDueToday(dueDate: string): boolean {
  const today = new Date()
  const [y, m, d] = dueDate.split('-').map(Number)
  return (
    today.getFullYear() === y &&
    today.getMonth() + 1 === m &&
    today.getDate() === d
  )
}

// ─── Réorganisation drag & drop ───────────────────────────────────────────────

export function reorderTasks(tasks: Task[], activeId: string, overId: string): Task[] {
  const activeIndex = tasks.findIndex((t) => t.id === activeId)
  const overIndex = tasks.findIndex((t) => t.id === overId)
  if (activeIndex === -1 || overIndex === -1) return tasks

  const reordered = [...tasks]
  const [moved] = reordered.splice(activeIndex, 1)
  reordered.splice(overIndex, 0, moved)

  return reordered.map((t, i) => ({ ...t, order: i }))
}
