import type { BudgetMonth, Expense } from '@/types'

// ─── Calculs ──────────────────────────────────────────────────────────────────

export interface BudgetSummary {
  totalAll: number
  totalObligatoire: number
  totalFacultatif: number
  resteAll: number
  resteApresObligatoire: number
  resteAPayer: number
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

export interface ExpenseFormValues {
  description: string
  category: string
  amount: string   // chaîne pour le champ texte, converti en number à la soumission
  paid: boolean
  type: 'obligatoire' | 'facultatif'
}

// ─── Re-exports pour usage interne ────────────────────────────────────────────

export type { BudgetMonth, Expense }
