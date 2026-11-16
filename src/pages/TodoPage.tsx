import { useState } from 'react'
import { Plus, FolderPlus, ListChecks } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Fab, Button, ConfirmDialog, EmptyState } from '@/components/ui'
import { useTodo } from '@/features/todo/hooks/useTodo'
import { TaskGroupSection } from '@/features/todo/components/TaskGroupSection'
import { TaskForm } from '@/features/todo/components/TaskForm'
import { GroupForm } from '@/features/todo/components/GroupForm'
import type { Task, TaskGroup } from '@/types'
import type { TaskFormValues, GroupFormValues } from '@/features/todo/types'

export function TodoPage() {
  const {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    reorderTasksInGroup,
    getActiveTasksForGroup,
    getDoneTasksForGroup,
    collapsedGroups,
    toggleGroupCollapse,
  } = useTodo()

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [isTaskFormOpen, setTaskFormOpen] = useState(false)
  const [isGroupFormOpen, setGroupFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [editingGroup, setEditingGroup] = useState<TaskGroup | undefined>()
  const [defaultGroupId, setDefaultGroupId] = useState<string | undefined>()
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  // ─── Handlers tâches ──────────────────────────────────────────────────────
  function handleAddTask(groupId: string) {
    setDefaultGroupId(groupId)
    setEditingTask(undefined)
    setTaskFormOpen(true)
  }

  function handleEditTask(task: Task) {
    setEditingTask(task)
    setDefaultGroupId(undefined)
    setTaskFormOpen(true)
  }

  function handleTaskFormClose() {
    setTaskFormOpen(false)
    setEditingTask(undefined)
    setDefaultGroupId(undefined)
  }

  function handleTaskSubmit(values: TaskFormValues) {
    if (editingTask) {
      void updateTask(editingTask.id, values)
    } else {
      void addTask(values)
    }
  }

  function handleDeleteTaskConfirm() {
    if (deletingTaskId) {
      deleteTask(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  // ─── Handlers groupes ─────────────────────────────────────────────────────
  function handleEditGroup(group: TaskGroup) {
    setEditingGroup(group)
    setGroupFormOpen(true)
  }

  function handleGroupFormClose() {
    setGroupFormOpen(false)
    setEditingGroup(undefined)
  }

  function handleGroupSubmit(values: GroupFormValues) {
    if (editingGroup) {
      updateGroup(editingGroup.id, values)
    } else {
      addGroup(values)
    }
  }

  function handleDeleteGroupConfirm() {
    if (deletingGroupId) {
      deleteGroup(deletingGroupId)
      setDeletingGroupId(null)
    }
  }

  const deletingGroup = groups.find((g) => g.id === deletingGroupId)

  // ─── Header droit : bouton nouveau groupe ─────────────────────────────────
  const headerRight = (
    <button
      onClick={() => { setEditingGroup(undefined); setGroupFormOpen(true) }}
      aria-label="Nouveau groupe"
      className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
    >
      <FolderPlus size={18} />
    </button>
  )

  return (
    <Layout title="To-do list" headerRight={headerRight}>
      {groups.length === 0 ? (
        /* État vide : aucun groupe */
        <div className="flex flex-col items-center justify-center gap-4 h-full px-6 pb-20">
          <EmptyState
            icon={<ListChecks size={40} />}
            title="Aucun groupe de tâches"
            description="Crée un groupe pour commencer à organiser tes tâches"
          />
          <Button
            onClick={() => setGroupFormOpen(true)}
            variant="secondary"
          >
            <FolderPlus size={16} />
            Créer un groupe
          </Button>
        </div>
      ) : (
        <div className="pb-24">
          {groups.map((group) => (
            <TaskGroupSection
              key={group.id}
              group={group}
              activeTasks={getActiveTasksForGroup(group.id)}
              doneTasks={getDoneTasksForGroup(group.id)}
              isCollapsed={collapsedGroups.has(group.id)}
              onToggleCollapse={() => toggleGroupCollapse(group.id)}
              onEditGroup={handleEditGroup}
              onDeleteGroup={(g) => setDeletingGroupId(g.id)}
              onAddTask={handleAddTask}
              onToggleTaskDone={toggleTaskDone}
              onEditTask={handleEditTask}
              onDeleteTask={(id) => setDeletingTaskId(id)}
              onReorderTasks={reorderTasksInGroup}
            />
          ))}
        </div>
      )}

      {/* FAB — nouvelle tâche (seulement si au moins 1 groupe) */}
      {groups.length > 0 && (
        <Fab
          onClick={() => { setDefaultGroupId(groups[0]?.id); setTaskFormOpen(true) }}
          icon={<Plus size={24} />}
          label="Ajouter une tâche"
        />
      )}

      {/* Formulaire tâche */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleTaskFormClose}
        onSubmit={handleTaskSubmit}
        groups={groups}
        defaultGroupId={defaultGroupId}
        initialValues={editingTask}
      />

      {/* Formulaire groupe */}
      <GroupForm
        isOpen={isGroupFormOpen}
        onClose={handleGroupFormClose}
        onSubmit={handleGroupSubmit}
        initialValues={editingGroup}
      />

      {/* Confirmation suppression tâche */}
      <ConfirmDialog
        isOpen={!!deletingTaskId}
        title="Supprimer la tâche ?"
        message="Cette action est irréversible."
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => setDeletingTaskId(null)}
      />

      {/* Confirmation suppression groupe */}
      <ConfirmDialog
        isOpen={!!deletingGroupId}
        title={`Supprimer "${deletingGroup?.name}" ?`}
        message="Toutes les tâches de ce groupe seront supprimées. Cette action est irréversible."
        onConfirm={handleDeleteGroupConfirm}
        onCancel={() => setDeletingGroupId(null)}
      />
    </Layout>
  )
}
