import { useState, useCallback, useMemo } from 'react'
import { budgetStorage } from '@/storage'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { generateId, buildMonthId, currentYearMonth, prevMonth, nextMonth } from '@/utils'
import { computeBudgetSummary, findMonth, upsertMonth, duplicateExpenses, buildPrevMonthId, sortExpenses, type SortKey } from '../utils'
import type { Expense, BudgetMonth } from '@/types'
import type { ExpenseFormValues } from '../types'

export function useBudget() {
  // ─── Navigation de mois ───────────────────────────────────────────────────
  const { year: initYear, month: initMonth } = currentYearMonth()
  const [year, setYear] = useState(initYear)
  const [month, setMonth] = useState(initMonth)
  const monthId = buildMonthId(year, month)

  // ─── Persistance ──────────────────────────────────────────────────────────
  const [months, setMonths] = useLocalStorage(
    budgetStorage.getMonths,
    budgetStorage.setMonths,
  )
  const [categories, setCategories] = useLocalStorage(
    budgetStorage.getCategories,
    budgetStorage.setCategories,
  )

  // ─── Mois courant (peut être undefined si jamais créé) ───────────────────
  const currentMonth: BudgetMonth | undefined = useMemo(
    () => findMonth(months, monthId),
    [months, monthId],
  )

  const expenses = currentMonth?.expenses ?? []
  const budget = currentMonth?.budget ?? 0

  // ─── Tri ──────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const sortedExpenses = useMemo(() => sortExpenses(expenses, sortKey), [expenses, sortKey])

  // ─── Résumé calculé ───────────────────────────────────────────────────────
  const summary = useMemo(
    () => computeBudgetSummary(budget, expenses),
    [budget, expenses],
  )

  // ─── Mettre à jour le mois courant ───────────────────────────────────────
  const updateCurrentMonth = useCallback(
    (updater: (m: BudgetMonth) => BudgetMonth) => {
      const base: BudgetMonth = currentMonth ?? {
        id: monthId,
        year,
        month,
        budget: 0,
        expenses: [],
      }
      setMonths((prev) => upsertMonth(prev, updater(base)))
    },
    [currentMonth, monthId, year, month, setMonths],
  )

  // ─── Budget mensuel ───────────────────────────────────────────────────────
  const setBudget = useCallback(
    (amount: number) => {
      updateCurrentMonth((m) => ({ ...m, budget: amount }))
    },
    [updateCurrentMonth],
  )

  // ─── CRUD dépenses ────────────────────────────────────────────────────────
  const addExpense = useCallback(
    (values: ExpenseFormValues) => {
      const expense: Expense = {
        id: generateId(),
        description: values.description.trim(),
        category: values.category,
        amount: parseFloat(values.amount),
        paid: values.paid,
        type: values.type,
        createdAt: new Date().toISOString(),
      }
      updateCurrentMonth((m) => ({ ...m, expenses: [...m.expenses, expense] }))
    },
    [updateCurrentMonth],
  )

  const updateExpense = useCallback(
    (id: string, values: ExpenseFormValues) => {
      updateCurrentMonth((m) => ({
        ...m,
        expenses: m.expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                description: values.description.trim(),
                category: values.category,
                amount: parseFloat(values.amount),
                paid: values.paid,
                type: values.type,
              }
            : e,
        ),
      }))
    },
    [updateCurrentMonth],
  )

  const deleteExpense = useCallback(
    (id: string) => {
      updateCurrentMonth((m) => ({
        ...m,
        expenses: m.expenses.filter((e) => e.id !== id),
      }))
    },
    [updateCurrentMonth],
  )

  const togglePaid = useCallback(
    (id: string) => {
      updateCurrentMonth((m) => ({
        ...m,
        expenses: m.expenses.map((e) => (e.id === id ? { ...e, paid: !e.paid } : e)),
      }))
    },
    [updateCurrentMonth],
  )

  // ─── Duplication depuis le mois précédent ────────────────────────────────
  const canDuplicateFromPrev = useMemo(() => {
    const prevId = buildPrevMonthId(year, month)
    const prevMonthData = findMonth(months, prevId)
    return (prevMonthData?.expenses.length ?? 0) > 0
  }, [months, year, month])

  const duplicateFromPrevMonth = useCallback(() => {
    const prevId = buildPrevMonthId(year, month)
    const prevMonthData = findMonth(months, prevId)
    if (!prevMonthData) return
    const duplicated = duplicateExpenses(prevMonthData.expenses, generateId)
    updateCurrentMonth((m) => ({
      ...m,
      expenses: [...m.expenses, ...duplicated],
    }))
  }, [months, year, month, updateCurrentMonth])

  // ─── Navigation entre mois ───────────────────────────────────────────────
  const goToPrevMonth = useCallback(() => {
    const p = prevMonth(year, month)
    setYear(p.year)
    setMonth(p.month)
  }, [year, month])

  const goToNextMonth = useCallback(() => {
    const n = nextMonth(year, month)
    setYear(n.year)
    setMonth(n.month)
  }, [year, month])

  const goToCurrentMonth = useCallback(() => {
    const { year: y, month: m } = currentYearMonth()
    setYear(y)
    setMonth(m)
  }, [])

  // ─── Catégories ───────────────────────────────────────────────────────────
  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed || categories.includes(trimmed)) return
      setCategories((prev) => [...prev, trimmed])
    },
    [categories, setCategories],
  )

  const deleteCategory = useCallback(
    (name: string) => {
      setCategories((prev) => prev.filter((c) => c !== name))
    },
    [setCategories],
  )

  return {
    // navigation
    year,
    month,
    monthId,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    // données
    budget,
    setBudget,
    expenses: sortedExpenses,
    summary,
    // CRUD
    addExpense,
    updateExpense,
    deleteExpense,
    togglePaid,
    // duplication
    canDuplicateFromPrev,
    duplicateFromPrevMonth,
    // tri
    sortKey,
    setSortKey,
    // catégories
    categories,
    addCategory,
    deleteCategory,
  }
}
