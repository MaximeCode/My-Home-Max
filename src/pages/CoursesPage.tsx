import { useState } from 'react'
import { Plus, RotateCcw, ShoppingBasket, AlertTriangle, Trash2 } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Fab, Button, ConfirmDialog, EmptyState } from '@/components/ui'
import { useGroceries } from '@/features/courses/hooks/useGroceries'
import { GroceryForm } from '@/features/courses/components/GroceryForm'
import { GroceryItemRow } from '@/features/courses/components/GroceryItemRow'
import type { GroceryItem } from '@/types'

export function CoursesPage() {
  const {
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
  } = useGroceries()

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [isFormOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | undefined>()
  const [isDuplicateWarning, setDuplicateWarning] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [confirmUncheck, setConfirmUncheck] = useState(false)
  const [confirmDeleteBought, setConfirmDeleteBought] = useState(false)

  function handleFormClose() {
    setFormOpen(false)
    setEditingItem(undefined)
    setDuplicateWarning(false)
  }

  function handleFormSubmit(values: Parameters<typeof addItem>[0]) {
    if (editingItem) {
      updateItem(editingItem.id, values)
    } else {
      const { isDuplicate } = addItem(values)
      if (isDuplicate) setDuplicateWarning(true)
    }
  }

  function handleEditItem(item: GroceryItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  const boughtCount = items.filter((i) => i.bought).length

  // ─── Header droit : actions liste ─────────────────────────────────────────
  const headerRight = (
    <div className="flex items-center gap-1">
      {boughtCount > 0 && (
        <button
          onClick={() => setConfirmDeleteBought(true)}
          aria-label="Supprimer les articles achetés"
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
      {boughtCount > 0 && (
        <button
          onClick={() => setConfirmUncheck(true)}
          aria-label="Tout décocher"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  )

  return (
    <Layout title="Courses" headerRight={headerRight}>
      {/* Compteur */}
      {items.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-800">
          <p className="text-xs text-slate-500">
            {remainingCount === 0
              ? '✅ Tout est dans le panier !'
              : `${remainingCount} article${remainingCount > 1 ? 's' : ''} restant${remainingCount > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Avertissement doublon */}
      {isDuplicateWarning && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2.5">
          <AlertTriangle size={15} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300">
            Un article similaire existe déjà dans ta liste.
          </p>
          <button
            onClick={() => setDuplicateWarning(false)}
            className="ml-auto text-orange-400 hover:text-orange-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Liste vide */}
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket size={40} />}
          title="Liste de courses vide"
          description='Appuie sur + pour ajouter un article'
        />
      ) : (
        <div className="pb-24">
          {groupedItems.map(({ tag, items: tagItems }) => (
            <div key={tag}>
              {/* En-tête de catégorie */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 sticky top-0 z-10">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {tag}
                </span>
                <span className="ml-2 text-xs text-slate-600">
                  {tagItems.filter((i) => !i.bought).length}/{tagItems.length}
                </span>
              </div>

              {/* Articles de la catégorie */}
              {tagItems.map((item) => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  onToggleBought={toggleBought}
                  onEdit={handleEditItem}
                  onDelete={(id) => setDeletingItemId(id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <Fab
        onClick={() => setFormOpen(true)}
        icon={<Plus size={24} />}
        label="Ajouter un article"
      />

      {/* Formulaire */}
      <GroceryForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        availableTags={tags}
        initialValues={editingItem}
        isDuplicateWarning={isDuplicateWarning}
      />

      {/* Confirmation suppression article */}
      <ConfirmDialog
        isOpen={!!deletingItemId}
        title="Supprimer cet article ?"
        message="Cette action est irréversible."
        onConfirm={() => { if (deletingItemId) deleteItem(deletingItemId); setDeletingItemId(null) }}
        onCancel={() => setDeletingItemId(null)}
      />

      {/* Confirmation tout décocher */}
      <ConfirmDialog
        isOpen={confirmUncheck}
        title="Tout décocher ?"
        message="Tous les articles seront remis à « non acheté »."
        confirmLabel="Tout décocher"
        onConfirm={() => { uncheckAll(); setConfirmUncheck(false) }}
        onCancel={() => setConfirmUncheck(false)}
      />

      {/* Confirmation supprimer les achetés */}
      <ConfirmDialog
        isOpen={confirmDeleteBought}
        title={`Supprimer les ${boughtCount} article${boughtCount > 1 ? 's' : ''} achetés ?`}
        message="Les articles cochés seront définitivement supprimés."
        confirmLabel="Supprimer"
        onConfirm={() => { deleteBoughtItems(); setConfirmDeleteBought(false) }}
        onCancel={() => setConfirmDeleteBought(false)}
      />
    </Layout>
  )
}
