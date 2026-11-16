import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Input, Select, Button } from '@/components/ui'
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils'
import type { TaskFormValues } from '../types'
import type { Task, TaskGroup } from '@/types'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
  groups: TaskGroup[]
  defaultGroupId?: string
  initialValues?: Task
}

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  description: '',
  groupId: '',
  status: 'todo',
  priority: 'normal',
  dueDate: '',
  dueTime: '',
}

function taskToFormValues(t: Task): TaskFormValues {
  return {
    title: t.title,
    description: t.description,
    groupId: t.groupId,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ?? '',
    dueTime: t.dueTime ?? '',
  }
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  groups,
  defaultGroupId,
  initialValues,
}: TaskFormProps) {
  const isEditing = !!initialValues
  const [values, setValues] = useState<TaskFormValues>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({})

  useEffect(() => {
    if (isOpen) {
      setValues(
        initialValues
          ? taskToFormValues(initialValues)
          : {
              ...DEFAULT_VALUES,
              groupId: defaultGroupId ?? groups[0]?.id ?? '',
            },
      )
      setErrors({})
    }
  }, [isOpen, initialValues, defaultGroupId, groups])

  function validate(): boolean {
    const next: typeof errors = {}
    if (!values.title.trim()) next.title = 'Titre requis'
    if (!values.groupId) next.groupId = 'Groupe requis'
    if (values.dueTime && !values.dueDate) next.dueDate = 'Une heure nécessite une date'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit(values)
    onClose()
  }

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }))
  const statusOptions = (Object.entries(STATUS_LABELS) as [Task['status'], string][]).map(
    ([value, label]) => ({ value, label }),
  )
  const priorityOptions = (Object.entries(PRIORITY_LABELS) as [Task['priority'], string][]).map(
    ([value, label]) => ({ value, label }),
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Titre"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="Ex. Appeler le médecin"
          error={errors.title}
          autoFocus
        />

        <Input
          label="Description (optionnel)"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Détails supplémentaires…"
        />

        <Select
          label="Groupe"
          value={values.groupId}
          onChange={(e) => setValues((v) => ({ ...v, groupId: e.target.value }))}
          options={groupOptions}
          error={errors.groupId}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priorité"
            value={values.priority}
            onChange={(e) =>
              setValues((v) => ({ ...v, priority: e.target.value as Task['priority'] }))
            }
            options={priorityOptions}
          />
          <Select
            label="Statut"
            value={values.status}
            onChange={(e) =>
              setValues((v) => ({ ...v, status: e.target.value as Task['status'] }))
            }
            options={statusOptions}
          />
        </div>

        {/* Date et heure de rappel */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-300">Rappel (optionnel)</span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={values.dueDate}
              onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
              error={errors.dueDate}
            />
            <Input
              label="Heure"
              type="time"
              value={values.dueTime}
              onChange={(e) => setValues((v) => ({ ...v, dueTime: e.target.value }))}
              disabled={!values.dueDate}
            />
          </div>
          {values.dueDate && (
            <p className="text-xs text-slate-500">
              {values.dueTime
                ? `Notification à ${values.dueTime} le jour J`
                : 'Notification à 8 h le jour J'}
            </p>
          )}
        </div>

        <Button type="button" fullWidth onClick={handleSubmit}>
          {isEditing ? 'Enregistrer' : 'Ajouter la tâche'}
        </Button>
      </div>
    </BottomSheet>
  )
}
