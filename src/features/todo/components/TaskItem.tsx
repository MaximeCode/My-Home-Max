import { Check, Pencil, Trash2, AlertCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui'
import { PRIORITY_LABELS } from '../utils'
import { isOverdue, isDueToday } from '../utils'
import { formatDate } from '@/utils'
import type { Task } from '@/types'

interface TaskItemProps {
  task: Task
  onToggleDone: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  /** Fourni par dnd-kit quand la tâche est en cours de drag */
  dragHandleProps?: Record<string, unknown>
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colorMap: Record<Task['priority'], 'red' | 'orange' | 'slate' | 'indigo'> = {
    urgent: 'red',
    high: 'orange',
    normal: 'indigo',
    low: 'slate',
  }
  if (priority === 'normal') return null // On n'affiche pas "Normale" pour ne pas surcharger
  return <Badge color={colorMap[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}

function DueDateLabel({ dueDate, dueTime }: { dueDate: string; dueTime: string | null }) {
  const overdue = isOverdue(dueDate)
  const today = isDueToday(dueDate)

  const label = today
    ? `Aujourd'hui${dueTime ? ` à ${dueTime}` : ''}`
    : `${formatDate(dueDate)}${dueTime ? ` à ${dueTime}` : ''}`

  const color = overdue ? 'text-red-400' : today ? 'text-orange-400' : 'text-slate-500'
  const Icon = overdue ? AlertCircle : Clock

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  )
}

export function TaskItem({ task, onToggleDone, onEdit, onDelete, dragHandleProps }: TaskItemProps) {
  const isDone = task.status === 'done'

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 transition-opacity ${
        isDone ? 'opacity-40' : ''
      }`}
      {...dragHandleProps}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleDone(task.id)}
        aria-label={isDone ? 'Rouvrir la tâche' : 'Marquer comme terminée'}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isDone
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-slate-600 hover:border-indigo-400'
        }`}
      >
        {isDone && <Check size={11} strokeWidth={3} className="text-white" />}
      </button>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && <DueDateLabel dueDate={task.dueDate} dueTime={task.dueTime} />}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-0.5">
        <button
          onClick={() => onEdit(task)}
          aria-label="Modifier"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Supprimer"
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
