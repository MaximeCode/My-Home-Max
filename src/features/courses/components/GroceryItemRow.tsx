import { Check, Pencil, Trash2 } from 'lucide-react'
import type { GroceryItem } from '@/types'

interface GroceryItemRowProps {
  item: GroceryItem
  onToggleBought: (id: string) => void
  onEdit: (item: GroceryItem) => void
  onDelete: (id: string) => void
}

export function GroceryItemRow({ item, onToggleBought, onEdit, onDelete }: GroceryItemRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 transition-opacity ${
        item.bought ? 'opacity-45' : ''
      }`}
    >
      {/* Checkbox acheté */}
      <button
        onClick={() => onToggleBought(item.id)}
        aria-label={item.bought ? 'Décocher' : 'Cocher comme acheté'}
        className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
          item.bought
            ? 'border-orange-500 bg-orange-500'
            : 'border-slate-600 hover:border-orange-400'
        }`}
      >
        {item.bought && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>

      {/* Nom + quantité */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium ${
            item.bought ? 'line-through text-slate-500' : 'text-slate-100'
          }`}
        >
          {item.name}
        </span>
        {item.quantity && (
          <span className="ml-2 text-xs text-slate-500">{item.quantity}</span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-0.5">
        <button
          onClick={() => onEdit(item)}
          aria-label="Modifier"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          aria-label="Supprimer"
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
