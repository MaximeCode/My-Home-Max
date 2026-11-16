import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Input, Button } from '@/components/ui'
import type { GroceryFormValues } from '../types'
import type { GroceryItem } from '@/types'

interface GroceryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: GroceryFormValues) => void
  availableTags: string[]
  initialValues?: GroceryItem
  /** Affichée si un article de même nom existe déjà */
  isDuplicateWarning?: boolean
}

const DEFAULT_VALUES: GroceryFormValues = {
  name: '',
  quantity: '',
  tags: [],
}

function itemToFormValues(item: GroceryItem): GroceryFormValues {
  return {
    name: item.name,
    quantity: item.quantity,
    tags: item.tags,
  }
}

export function GroceryForm({
  isOpen,
  onClose,
  onSubmit,
  availableTags,
  initialValues,
}: GroceryFormProps) {
  const isEditing = !!initialValues
  const [values, setValues] = useState<GroceryFormValues>(DEFAULT_VALUES)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues ? itemToFormValues(initialValues) : DEFAULT_VALUES)
      setNameError('')
    }
  }, [isOpen, initialValues])

  function toggleTag(tag: string) {
    setValues((v) => ({
      ...v,
      tags: v.tags.includes(tag) ? v.tags.filter((t) => t !== tag) : [...v.tags, tag],
    }))
  }

  function handleSubmit() {
    if (!values.name.trim()) {
      setNameError('Nom requis')
      return
    }
    onSubmit(values)
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier l\'article' : 'Nouvel article'}
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Article"
          value={values.name}
          onChange={(e) => { setValues((v) => ({ ...v, name: e.target.value })); setNameError('') }}
          placeholder="Ex. Bananes, Lait…"
          error={nameError}
          autoFocus
        />

        <Input
          label="Quantité (optionnel)"
          value={values.quantity}
          onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
          placeholder="Ex. 2, 1 kg, 500 ml…"
        />

        {/* Sélection des tags */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Catégorie (optionnel)</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = values.tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <Button type="button" fullWidth onClick={handleSubmit}>
          {isEditing ? 'Enregistrer' : 'Ajouter à la liste'}
        </Button>
      </div>
    </BottomSheet>
  )
}
