import { Check, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/utils'
import { Badge } from '@/components/ui'
import type { Expense } from '@/types'

interface ExpenseItemProps {
  expense: Expense
  onTogglePaid: (id: string) => void
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({ expense, onTogglePaid, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 transition-opacity ${
        expense.paid ? 'opacity-50' : ''
      }`}
    >
      {/* Checkbox payé */}
      <button
        onClick={() => onTogglePaid(expense.id)}
        aria-label={expense.paid ? 'Marquer non payé' : 'Marquer payé'}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          expense.paid
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-slate-600 hover:border-slate-400'
        }`}
      >
        {expense.paid && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${expense.paid ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {expense.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500">{expense.category}</span>
          <Badge color={expense.type === 'obligatoire' ? 'orange' : 'slate'}>
            {expense.type === 'obligatoire' ? 'Oblig.' : 'Facultatif'}
          </Badge>
        </div>
      </div>

      {/* Montant */}
      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-200">
        {formatCurrency(expense.amount)}
      </span>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1">
        <button
          onClick={() => onEdit(expense)}
          aria-label="Modifier"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          aria-label="Supprimer"
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
