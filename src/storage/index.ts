import type {
  BudgetMonth,
  TaskGroup,
  Task,
  GroceryItem,
  AppSettings,
} from '@/types'

// ─── Clés ─────────────────────────────────────────────────────────────────────

const KEYS = {
  BUDGET_MONTHS: 'gp_budget_months',
  BUDGET_CATEGORIES: 'gp_budget_categories',
  TODO_GROUPS: 'gp_todo_groups',
  TODO_TASKS: 'gp_todo_tasks',
  GROCERIES_ITEMS: 'gp_groceries_items',
  GROCERIES_TAGS: 'gp_groceries_tags',
  SETTINGS: 'gp_settings',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export const budgetStorage = {
  getMonths: (): BudgetMonth[] => readJson<BudgetMonth[]>(KEYS.BUDGET_MONTHS, []),
  setMonths: (months: BudgetMonth[]): void => writeJson(KEYS.BUDGET_MONTHS, months),

  getCategories: (): string[] =>
    readJson<string[]>(KEYS.BUDGET_CATEGORIES, [
      'Voiture',
      'Logement',
      'Alimentation',
      'Sport',
      'Perso',
      'Transport',
      'Frais bancaires',
    ]),
  setCategories: (categories: string[]): void =>
    writeJson(KEYS.BUDGET_CATEGORIES, categories),
}

// ─── Todo ─────────────────────────────────────────────────────────────────────

export const todoStorage = {
  getGroups: (): TaskGroup[] => readJson<TaskGroup[]>(KEYS.TODO_GROUPS, []),
  setGroups: (groups: TaskGroup[]): void => writeJson(KEYS.TODO_GROUPS, groups),

  getTasks: (): Task[] => readJson<Task[]>(KEYS.TODO_TASKS, []),
  setTasks: (tasks: Task[]): void => writeJson(KEYS.TODO_TASKS, tasks),
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export const groceriesStorage = {
  getItems: (): GroceryItem[] => readJson<GroceryItem[]>(KEYS.GROCERIES_ITEMS, []),
  setItems: (items: GroceryItem[]): void => writeJson(KEYS.GROCERIES_ITEMS, items),

  getTags: (): string[] =>
    readJson<string[]>(KEYS.GROCERIES_TAGS, [
      'Alimentaire',
      'Boissons',
      'Hygiène',
      'Maison',
      'Sports',
      'Surgelés',
      'Épicerie',
    ]),
  setTags: (tags: string[]): void => writeJson(KEYS.GROCERIES_TAGS, tags),
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  notificationsGranted: false,
}

export const settingsStorage = {
  get: (): AppSettings => readJson<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  set: (settings: AppSettings): void => writeJson(KEYS.SETTINGS, settings),
}
