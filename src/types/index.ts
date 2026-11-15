// ─── Budget ───────────────────────────────────────────────────────────────────

export type ExpenseType = 'obligatoire' | 'facultatif'

export interface Expense {
  id: string
  description: string
  category: string
  amount: number
  paid: boolean
  type: ExpenseType
  createdAt: string
}

export interface BudgetMonth {
  id: string        // format YYYY-MM
  year: number
  month: number     // 1-12
  budget: number
  expenses: Expense[]
}

// ─── Todo ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Task {
  id: string
  groupId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null    // ISO date string YYYY-MM-DD
  dueTime: string | null    // HH:mm — si défini, notif à l'heure exacte ; sinon 08:00 le matin du jour J
  order: number
  createdAt: string
}

export interface TaskGroup {
  id: string
  name: string
  order: number
  createdAt: string
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export interface GroceryItem {
  id: string
  name: string
  quantity: string   // ex. "2", "1 kg", "500 ml" — chaîne libre
  tags: string[]
  bought: boolean
  createdAt: string
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface AppSettings {
  notificationsGranted: boolean
}
