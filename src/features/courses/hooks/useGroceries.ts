import { useCallback, useMemo } from 'react'
import { groceriesStorage } from '@/storage'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { generateId } from '@/utils'
import { groupItemsByTag, findDuplicate, countRemaining } from '../utils'
import type { GroceryItem } from '@/types'
import type { GroceryFormValues } from '../types'

export function useGroceries() {
  // ─── Persistance ──────────────────────────────────────────────────────────
  const [items, setItems] = useLocalStorage(
    groceriesStorage.getItems,
    groceriesStorage.setItems,
  )
  const [tags, setTags] = useLocalStorage(
    groceriesStorage.getTags,
    groceriesStorage.setTags,
  )

  // ─── Données dérivées ─────────────────────────────────────────────────────
  const groupedItems = useMemo(() => groupItemsByTag(items), [items])
  const remainingCount = useMemo(() => countRemaining(items), [items])

  // ─── CRUD articles ────────────────────────────────────────────────────────
  const addItem = useCallback(
    (values: GroceryFormValues): { isDuplicate: boolean } => {
      const duplicate = findDuplicate(items, values.name)
      const item: GroceryItem = {
        id: generateId(),
        name: values.name.trim(),
        quantity: values.quantity.trim(),
        tags: values.tags,
        bought: false,
        createdAt: new Date().toISOString(),
      }
      setItems((prev) => [...prev, item])
      return { isDuplicate: !!duplicate }
    },
    [items, setItems],
  )

  const updateItem = useCallback(
    (id: string, values: GroceryFormValues) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, name: values.name.trim(), quantity: values.quantity.trim(), tags: values.tags }
            : i,
        ),
      )
    },
    [setItems],
  )

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [setItems],
  )

  const toggleBought = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)),
      )
    },
    [setItems],
  )

  // ─── Réinitialisation ─────────────────────────────────────────────────────
  const uncheckAll = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, bought: false })))
  }, [setItems])

  const deleteBoughtItems = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.bought))
  }, [setItems])

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const addTag = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed || tags.includes(trimmed)) return
      setTags((prev) => [...prev, trimmed].sort((a, b) => a.localeCompare(b, 'fr')))
    },
    [tags, setTags],
  )

  const deleteTag = useCallback(
    (name: string) => {
      setTags((prev) => prev.filter((t) => t !== name))
      // Retirer ce tag des articles qui l'utilisent
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          tags: i.tags.filter((t) => t !== name),
        })),
      )
    },
    [setTags, setItems],
  )

  return {
    items,
    groupedItems,
    remainingCount,
    addItem,
    updateItem,
    deleteItem,
    toggleBought,
    uncheckAll,
    deleteBoughtItems,
    tags,
    addTag,
    deleteTag,
  }
}
