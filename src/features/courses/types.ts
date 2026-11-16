import type { GroceryItem } from '@/types'

// ─── Formulaire article ───────────────────────────────────────────────────────

export interface GroceryFormValues {
  name: string
  quantity: string
  tags: string[]
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { GroceryItem }
