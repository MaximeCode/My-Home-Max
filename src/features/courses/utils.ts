import type { GroceryItem } from '@/types'
import { isSameName } from '@/utils'

// ─── Détection de doublons ────────────────────────────────────────────────────

export function findDuplicate(items: GroceryItem[], name: string): GroceryItem | undefined {
  return items.find((i) => isSameName(i.name, name))
}

// ─── Regroupement par tag ─────────────────────────────────────────────────────

export interface GroupedItems {
  tag: string
  items: GroceryItem[]
}

/**
 * Regroupe les articles par leur premier tag.
 * Les articles sans tag sont dans le groupe "Sans catégorie".
 * Les non-achetés apparaissent en premier dans chaque groupe.
 */
export function groupItemsByTag(items: GroceryItem[]): GroupedItems[] {
  const map = new Map<string, GroceryItem[]>()

  for (const item of items) {
    const tag = item.tags[0] ?? 'Sans catégorie'
    if (!map.has(tag)) map.set(tag, [])
    map.get(tag)!.push(item)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      // "Sans catégorie" toujours en dernier
      if (a === 'Sans catégorie') return 1
      if (b === 'Sans catégorie') return -1
      return a.localeCompare(b, 'fr')
    })
    .map(([tag, tagItems]) => ({
      tag,
      items: [...tagItems].sort((a, b) => {
        // Non-achetés d'abord
        if (a.bought !== b.bought) return a.bought ? 1 : -1
        return a.name.localeCompare(b.name, 'fr')
      }),
    }))
}

// ─── Compteurs ────────────────────────────────────────────────────────────────

export function countRemaining(items: GroceryItem[]): number {
  return items.filter((i) => !i.bought).length
}
