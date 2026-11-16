import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Input, Button } from '@/components/ui'
import type { GroupFormValues } from '../types'
import type { TaskGroup } from '@/types'

interface GroupFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: GroupFormValues) => void
  initialValues?: TaskGroup
}

export function GroupForm({ isOpen, onClose, onSubmit, initialValues }: GroupFormProps) {
  const isEditing = !!initialValues
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name ?? '')
      setError('')
    }
  }, [isOpen, initialValues])

  function handleSubmit() {
    if (!name.trim()) {
      setError('Nom requis')
      return
    }
    onSubmit({ name: name.trim() })
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Renommer le groupe' : 'Nouveau groupe'}
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nom du groupe"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Ex. Maison, Dev perso…"
          error={error}
          autoFocus
        />
        <Button type="button" fullWidth onClick={handleSubmit}>
          {isEditing ? 'Renommer' : 'Créer le groupe'}
        </Button>
      </div>
    </BottomSheet>
  )
}
