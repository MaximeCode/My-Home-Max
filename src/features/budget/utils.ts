import type { Expense, BudgetMonth } from '@/types'
import type { BudgetSummary } from './types'
import { buildMonthId } from '@/utils'

// ─── Calculs du résumé ────────────────────────────────────────────────────────

export function computeBudgetSummary(budget: number, expenses: Expense[]): BudgetSummary {
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalObligatoire = expenses
    .filter((e) => e.type === 'obligatoire')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalFacultatif = expenses
    .filter((e) => e.type === 'facultatif')
    .reduce((sum, e) => sum + e.amount, 0)
  const resteAPayer = expenses
    .filter((e) => !e.paid)
    .reduce((sum, e) => sum + e.amount, 0)

  return {
    totalAll,
    totalObligatoire,
    totalFacultatif,
    resteAll: budget - totalAll,
    resteApresObligatoire: budget - totalObligatoire,
    resteAPayer,
  }
}

// ─── Duplication du mois précédent ────────────────────────────────────────────

export function buildPrevMonthId(year: number, month: number): string {
  if (month === 1) return buildMonthId(year - 1, 12)
  return buildMonthId(year, month - 1)
}

/**
 * Duplique les dépenses d'un mois source vers un mois cible.
 * Les dépenses dupliquées sont toutes remises à "non payé".
 */
export function duplicateExpenses(
  sourceExpenses: Expense[],
  generateId: () => string,
): Expense[] {
  return sourceExpenses.map((e) => ({
    ...e,
    id: generateId(),
    paid: false,
    createdAt: new Date().toISOString(),
  }))
}

// ─── Tri des dépenses ─────────────────────────────────────────────────────────

export type SortKey = 'createdAt' | 'category' | 'type' | 'amount'

export function sortExpenses(expenses: Expense[], key: SortKey): Expense[] {
  return [...expenses].sort((a, b) => {
    switch (key) {
      case 'category':
        return a.category.localeCompare(b.category, 'fr')
      case 'type':
        return a.type.localeCompare(b.type)
      case 'amount':
        return b.amount - a.amount
      case 'createdAt':
      default:
        return a.createdAt.localeCompare(b.createdAt)
    }
  })
}

// ─── Recherche du mois courant dans la liste ──────────────────────────────────

export function findMonth(months: BudgetMonth[], id: string): BudgetMonth | undefined {
  return months.find((m) => m.id === id)
}

export function upsertMonth(months: BudgetMonth[], updated: BudgetMonth): BudgetMonth[] {
  const exists = months.some((m) => m.id === updated.id)
  return exists
    ? months.map((m) => (m.id === updated.id ? updated : m))
    : [...months, updated]
}
