import { useState, useCallback, useMemo } from 'react'
import { todoStorage } from '@/storage'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useNotifications } from '@/hooks/useNotifications'
import { generateId } from '@/utils'
import { sortedGroups, tasksByGroup, doneTasksByGroup, reorderTasks } from '../utils'
import type { Task, TaskGroup } from '@/types'
import type { TaskFormValues, GroupFormValues } from '../types'

export function useTodo() {
  // ─── Persistance ──────────────────────────────────────────────────────────
  const [groups, setGroups] = useLocalStorage(
    todoStorage.getGroups,
    todoStorage.setGroups,
  )
  const [tasks, setTasks] = useLocalStorage(
    todoStorage.getTasks,
    todoStorage.setTasks,
  )

  const { scheduleTaskNotification, cancelTaskNotification, requestPermission, isGranted } =
    useNotifications()

  // ─── Groupes triés ────────────────────────────────────────────────────────
  const orderedGroups = useMemo(() => sortedGroups(groups), [groups])

  // ─── Sections repliées ────────────────────────────────────────────────────
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(groupId) ? next.delete(groupId) : next.add(groupId)
      return next
    })
  }, [])

  // ─── CRUD Groupes ─────────────────────────────────────────────────────────
  const addGroup = useCallback(
    (values: GroupFormValues) => {
      const group: TaskGroup = {
        id: generateId(),
        name: values.name.trim(),
        order: groups.length,
        createdAt: new Date().toISOString(),
      }
      setGroups((prev) => [...prev, group])

      // Créer le groupe par défaut "To do" s'il n'existe pas encore
    },
    [groups.length, setGroups],
  )

  const updateGroup = useCallback(
    (id: string, values: GroupFormValues) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, name: values.name.trim() } : g)),
      )
    },
    [setGroups],
  )

  /**
   * Supprime un groupe ET toutes ses tâches (y compris leurs notifications).
   */
  const deleteGroup = useCallback(
    (id: string) => {
      const groupTasks = tasks.filter((t) => t.groupId === id)
      groupTasks.forEach((t) => void cancelTaskNotification(t.id))

      setGroups((prev) => prev.filter((g) => g.id !== id))
      setTasks((prev) => prev.filter((t) => t.groupId !== id))
    },
    [tasks, setGroups, setTasks, cancelTaskNotification],
  )

  // ─── CRUD Tâches ──────────────────────────────────────────────────────────
  const addTask = useCallback(
    async (values: TaskFormValues) => {
      const task: Task = {
        id: generateId(),
        groupId: values.groupId,
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
        dueTime: values.dueTime || null,
        order: tasks.filter((t) => t.groupId === values.groupId).length,
        createdAt: new Date().toISOString(),
      }

      setTasks((prev) => [...prev, task])

      // Planifier la notification si une date est définie
      if (task.dueDate) {
        if (!isGranted()) await requestPermission()
        void scheduleTaskNotification(task.id, task.title, task.dueDate, task.dueTime)
      }
    },
    [tasks, setTasks, isGranted, requestPermission, scheduleTaskNotification],
  )

  const updateTask = useCallback(
    async (id: string, values: TaskFormValues) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                groupId: values.groupId,
                title: values.title.trim(),
                description: values.description.trim(),
                status: values.status,
                priority: values.priority,
                dueDate: values.dueDate || null,
                dueTime: values.dueTime || null,
              }
            : t,
        ),
      )

      // Recalculer la notification
      void cancelTaskNotification(id)
      if (values.dueDate && values.status !== 'done') {
        if (!isGranted()) await requestPermission()
        void scheduleTaskNotification(id, values.title, values.dueDate, values.dueTime || null)
      }
    },
    [setTasks, cancelTaskNotification, isGranted, requestPermission, scheduleTaskNotification],
  )

  const deleteTask = useCallback(
    (id: string) => {
      void cancelTaskNotification(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [setTasks, cancelTaskNotification],
  )

  const toggleTaskDone = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const newStatus = t.status === 'done' ? 'todo' : 'done'
          if (newStatus === 'done') void cancelTaskNotification(id)
          else if (t.dueDate) {
            void scheduleTaskNotification(id, t.title, t.dueDate, t.dueTime)
          }
          return { ...t, status: newStatus }
        }),
      )
    },
    [setTasks, cancelTaskNotification, scheduleTaskNotification],
  )

  // ─── Drag & drop (réordonnancement dans un groupe) ────────────────────────
  const reorderTasksInGroup = useCallback(
    (groupId: string, activeId: string, overId: string) => {
      setTasks((prev) => {
        const groupTasks = prev.filter((t) => t.groupId === groupId)
        const otherTasks = prev.filter((t) => t.groupId !== groupId)
        const reordered = reorderTasks(groupTasks, activeId, overId)
        return [...otherTasks, ...reordered]
      })
    },
    [setTasks],
  )

  // ─── Helpers de vue ───────────────────────────────────────────────────────
  const getActiveTasksForGroup = useCallback(
    (groupId: string) => tasksByGroup(tasks, groupId),
    [tasks],
  )

  const getDoneTasksForGroup = useCallback(
    (groupId: string) => doneTasksByGroup(tasks, groupId),
    [tasks],
  )

  const activeTaskCount = useMemo(
    () => tasks.filter((t) => t.status !== 'done').length,
    [tasks],
  )

  return {
    groups: orderedGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    reorderTasksInGroup,
    getActiveTasksForGroup,
    getDoneTasksForGroup,
    collapsedGroups,
    toggleGroupCollapse,
    activeTaskCount,
  }
}
