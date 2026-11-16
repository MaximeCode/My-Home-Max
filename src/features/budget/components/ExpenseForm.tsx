import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Input, Select, Button } from '@/components/ui'
import type { ExpenseFormValues } from '../types'
import type { Expense } from '@/types'

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ExpenseFormValues) => void
  categories: string[]
  /** Si fourni, le formulaire est en mode édition */
  initialValues?: Expense
}

const DEFAULT_VALUES: ExpenseFormValues = {
  description: '',
  category: '',
  amount: '',
  paid: false,
  type: 'obligatoire',
}

function expenseToFormValues(e: Expense): ExpenseFormValues {
  return {
    description: e.description,
    category: e.category,
    amount: String(e.amount),
    paid: e.paid,
    type: e.type,
  }
}

export function ExpenseForm({ isOpen, onClose, onSubmit, categories, initialValues }: ExpenseFormProps) {
  const isEditing = !!initialValues
  const [values, setValues] = useState<ExpenseFormValues>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({})

  // Réinitialise le formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setValues(initialValues ? expenseToFormValues(initialValues) : {
        ...DEFAULT_VALUES,
        category: categories[0] ?? '',
      })
      setErrors({})
    }
  }, [isOpen, initialValues, categories])

  function validate(): boolean {
    const next: typeof errors = {}
    if (!values.description.trim()) next.description = 'Description requise'
    if (!values.category) next.category = 'Catégorie requise'
    const amt = parseFloat(values.amount)
    if (!values.amount || isNaN(amt) || amt <= 0) next.amount = 'Montant invalide'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit(values)
    onClose()
  }

  const categoryOptions = categories.map((c) => ({ value: c, label: c }))
  const typeOptions = [
    { value: 'obligatoire', label: 'Obligatoire' },
    { value: 'facultatif', label: 'Facultatif' },
  ]

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Description"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Ex. Loyer, Courses…"
          error={errors.description}
          autoFocus
        />

        <Select
          label="Catégorie"
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          options={categoryOptions}
          error={errors.category}
        />

        <Input
          label="Montant (€)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={values.amount}
          onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
          placeholder="0"
          error={errors.amount}
        />

        <Select
          label="Type"
          value={values.type}
          onChange={(e) =>
            setValues((v) => ({ ...v, type: e.target.value as 'obligatoire' | 'facultatif' }))
          }
          options={typeOptions}
        />

        {/* Payé */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setValues((v) => ({ ...v, paid: !v.paid }))}
            className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
              values.paid ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                values.paid ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-slate-300">Déjà payé</span>
        </label>

        <Button type="button" fullWidth onClick={handleSubmit}>
          {isEditing ? 'Enregistrer' : 'Ajouter la dépense'}
        </Button>
      </div>
    </BottomSheet>
  )
}
