import type { Page } from '@playwright/test'

export const TODO_GROUPS_KEY = 'gp_todo_groups'
export const TODO_TASKS_KEY = 'gp_todo_tasks'

export interface SeedGroup {
  id: string
  name: string
  order: number
  createdAt: string
}

export interface SeedTask {
  id: string
  groupId: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueDate: string | null
  dueTime: string | null
  order: number
  createdAt: string
}

/** Empêche les dialogs Notification de bloquer les tests. */
export async function stubNotifications(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      writable: true,
      value: class {
        static permission = 'denied'
        static async requestPermission() {
          return 'denied' as NotificationPermission
        }
        constructor() {
          /* noop */
        }
      },
    })
  })
}

export async function clearTodoStorage(page: Page): Promise<void> {
  await page.evaluate(
    ({ groupsKey, tasksKey }) => {
      localStorage.removeItem(groupsKey)
      localStorage.removeItem(tasksKey)
    },
    { groupsKey: TODO_GROUPS_KEY, tasksKey: TODO_TASKS_KEY },
  )
}

export async function seedTodo(
  page: Page,
  data: { groups?: SeedGroup[]; tasks?: SeedTask[] },
): Promise<void> {
  await page.evaluate(
    ({ groupsKey, tasksKey, groups, tasks }) => {
      localStorage.setItem(groupsKey, JSON.stringify(groups))
      localStorage.setItem(tasksKey, JSON.stringify(tasks))
    },
    {
      groupsKey: TODO_GROUPS_KEY,
      tasksKey: TODO_TASKS_KEY,
      groups: data.groups ?? [],
      tasks: data.tasks ?? [],
    },
  )
}

export function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const DEMO = {
  groupName: 'Maison',
  groupNameAlt: 'Courses',
  taskTitle: 'Appeler le médecin',
  taskTitleEdited: 'Appeler le médecin — confirmé',
  taskDescription: 'Prendre RDV contrôle annuel',
  priority: 'Haute',
  status: 'En cours',
  dueTime: '09:30',
} as const

export function makeGroup(overrides: Partial<SeedGroup> = {}): SeedGroup {
  return {
    id: overrides.id ?? 'group-maison',
    name: overrides.name ?? DEMO.groupName,
    order: overrides.order ?? 0,
    createdAt: overrides.createdAt ?? '2026-01-01T10:00:00.000Z',
  }
}

export function makeTask(overrides: Partial<SeedTask> = {}): SeedTask {
  return {
    id: overrides.id ?? 'task-medecin',
    groupId: overrides.groupId ?? 'group-maison',
    title: overrides.title ?? DEMO.taskTitle,
    description: overrides.description ?? DEMO.taskDescription,
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'normal',
    dueDate: overrides.dueDate ?? null,
    dueTime: overrides.dueTime ?? null,
    order: overrides.order ?? 0,
    createdAt: overrides.createdAt ?? '2026-01-01T11:00:00.000Z',
  }
}
