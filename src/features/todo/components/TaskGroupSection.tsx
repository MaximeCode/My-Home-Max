import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, GripVertical } from 'lucide-react'
import { TaskItem } from './TaskItem'
import type { Task, TaskGroup } from '@/types'

// ─── Tâche sortable (wrapper dnd-kit) ────────────────────────────────────────

interface SortableTaskItemProps {
  task: Task
  onToggleDone: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function SortableTaskItem({ task, onToggleDone, onEdit, onDelete }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      {/* Poignée de drag */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Réordonner"
        className="pl-3 pr-1 py-3 text-slate-700 hover:text-slate-500 touch-none cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <TaskItem
          task={task}
          onToggleDone={onToggleDone}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

// ─── Groupe avec ses tâches ───────────────────────────────────────────────────

interface TaskGroupSectionProps {
  group: TaskGroup
  activeTasks: Task[]
  doneTasks: Task[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  onEditGroup: (group: TaskGroup) => void
  onDeleteGroup: (group: TaskGroup) => void
  onAddTask: (groupId: string) => void
  onToggleTaskDone: (id: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onReorderTasks: (groupId: string, activeId: string, overId: string) => void
}

export function TaskGroupSection({
  group,
  activeTasks,
  doneTasks,
  isCollapsed,
  onToggleCollapse,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onToggleTaskDone,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
}: TaskGroupSectionProps) {
  const [showDone, setShowDone] = useState(false)
  const totalCount = activeTasks.length + doneTasks.length

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorderTasks(group.id, String(active.id), String(over.id))
    }
  }

  return (
    <div className="mb-2">
      {/* En-tête du groupe */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 sticky top-0 z-10 border-b border-slate-800">
        {/* Toggle collapse */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1 min-w-0"
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight size={15} className="text-slate-500 shrink-0" />
          ) : (
            <ChevronDown size={15} className="text-slate-500 shrink-0" />
          )}
          <span className="text-sm font-semibold text-slate-200 truncate">{group.name}</span>
          <span className="text-xs text-slate-500 shrink-0">
            {activeTasks.length}/{totalCount}
          </span>
        </button>

        {/* Actions groupe */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onAddTask(group.id)}
            aria-label="Ajouter une tâche"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onEditGroup(group)}
            aria-label="Renommer le groupe"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDeleteGroup(group)}
            aria-label="Supprimer le groupe"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tâches actives avec drag & drop */}
      {!isCollapsed && (
        <>
          {activeTasks.length === 0 && doneTasks.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-600 italic">
              Aucune tâche dans ce groupe
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onToggleDone={onToggleTaskDone}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Tâches terminées (repliables) */}
          {doneTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowDone((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showDone ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {doneTasks.length} terminée{doneTasks.length > 1 ? 's' : ''}
              </button>
              {showDone &&
                doneTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleDone={onToggleTaskDone}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
