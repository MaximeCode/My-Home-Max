import { ArrowDownUp } from 'lucide-react'
import type { SortKey } from '../utils'

interface SortBarProps {
  current: SortKey
  onChange: (key: SortKey) => void
}

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'createdAt', label: 'Date' },
  { key: 'category', label: 'Catégorie' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Montant' },
]

export function SortBar({ current, onChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-none">
      <ArrowDownUp size={14} className="text-slate-500 shrink-0" />
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            current === opt.key
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
