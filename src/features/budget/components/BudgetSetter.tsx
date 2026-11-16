import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Input, Button } from '@/components/ui'
import { formatCurrency } from '@/utils'

interface BudgetSetterProps {
  isOpen: boolean
  onClose: () => void
  currentBudget: number
  onSubmit: (amount: number) => void
}

export function BudgetSetter({ isOpen, onClose, currentBudget, onSubmit }: BudgetSetterProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleOpen() {
    setValue(currentBudget > 0 ? String(currentBudget) : '')
    setError('')
  }

  function handleSubmit() {
    const amount = parseFloat(value)
    if (!value || isNaN(amount) || amount <= 0) {
      setError('Montant invalide')
      return
    }
    onSubmit(amount)
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Définir le budget du mois"
    >
      <div className="flex flex-col gap-4">
        {currentBudget > 0 && (
          <p className="text-sm text-slate-400">
            Budget actuel : <span className="text-slate-200 font-medium">{formatCurrency(currentBudget)}</span>
          </p>
        )}
        <Input
          label="Budget mensuel (€)"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          placeholder="Ex. 1200"
          error={error}
          autoFocus
          onFocus={handleOpen}
        />
        <Button type="button" fullWidth onClick={handleSubmit}>
          Enregistrer
        </Button>
      </div>
    </BottomSheet>
  )
}
