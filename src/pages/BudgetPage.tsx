import { useState } from 'react'
import { Plus, Copy, Wallet, ReceiptText } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Fab, ConfirmDialog, EmptyState } from '@/components/ui'
import { useBudget } from '@/features/budget/hooks/useBudget'
import { MonthNavigator } from '@/features/budget/components/MonthNavigator'
import { SummaryCard } from '@/features/budget/components/SummaryCard'
import { ExpenseItem } from '@/features/budget/components/ExpenseItem'
import { ExpenseForm } from '@/features/budget/components/ExpenseForm'
import { BudgetSetter } from '@/features/budget/components/BudgetSetter'
import { SortBar } from '@/features/budget/components/SortBar'
import { formatCurrency } from '@/utils'
import type { Expense } from '@/types'

export function BudgetPage() {
  const {
    year, month,
    goToPrevMonth, goToNextMonth, goToCurrentMonth,
    budget, setBudget,
    expenses, summary,
    addExpense, updateExpense, deleteExpense, togglePaid,
    canDuplicateFromPrev, duplicateFromPrevMonth,
    sortKey, setSortKey,
    categories,
  } = useBudget()

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false)
  const [isBudgetSetterOpen, setBudgetSetterOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense)
    setExpenseFormOpen(true)
  }

  function handleFormClose() {
    setExpenseFormOpen(false)
    setEditingExpense(undefined)
  }

  function handleFormSubmit(values: Parameters<typeof addExpense>[0]) {
    if (editingExpense) {
      updateExpense(editingExpense.id, values)
    } else {
      addExpense(values)
    }
  }

  function handleDeleteConfirm() {
    if (deletingExpenseId) {
      deleteExpense(deletingExpenseId)
      setDeletingExpenseId(null)
    }
  }

  // Header droit : bouton définir budget
  const headerRight = (
    <button
      onClick={() => setBudgetSetterOpen(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
    >
      <Wallet size={14} className="text-emerald-400" />
      <span className="text-xs font-medium text-slate-200">
        {budget > 0 ? formatCurrency(budget) : 'Définir'}
      </span>
    </button>
  )

  return (
    <Layout title="Budget" headerRight={headerRight}>
      {/* Navigation mois */}
      <MonthNavigator
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onGoToCurrent={goToCurrentMonth}
      />

      {/* Résumé */}
      <SummaryCard budget={budget} summary={summary} />

      {/* Duplication depuis mois précédent */}
      {canDuplicateFromPrev && expenses.length === 0 && (
        <div className="mx-4 mb-3">
          <button
            onClick={duplicateFromPrevMonth}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              border border-dashed border-slate-700 text-sm text-slate-400
              hover:border-indigo-500 hover:text-indigo-400 transition-colors"
          >
            <Copy size={15} />
            Reprendre les dépenses du mois précédent
          </button>
        </div>
      )}

      {/* Tri */}
      {expenses.length > 1 && (
        <SortBar current={sortKey} onChange={setSortKey} />
      )}

      {/* Liste des dépenses */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={40} />}
          title="Aucune dépense ce mois"
          description='Appuie sur + pour ajouter ta première dépense'
        />
      ) : (
        <div className="pb-24">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onTogglePaid={togglePaid}
              onEdit={handleEditExpense}
              onDelete={(id) => setDeletingExpenseId(id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <Fab
        onClick={() => setExpenseFormOpen(true)}
        icon={<Plus size={24} />}
        label="Ajouter une dépense"
      />

      {/* Formulaire dépense */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialValues={editingExpense}
      />

      {/* Définir budget */}
      <BudgetSetter
        isOpen={isBudgetSetterOpen}
        onClose={() => setBudgetSetterOpen(false)}
        currentBudget={budget}
        onSubmit={setBudget}
      />

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={!!deletingExpenseId}
        title="Supprimer la dépense ?"
        message="Cette action est irréversible."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingExpenseId(null)}
      />
    </Layout>
  )
}
