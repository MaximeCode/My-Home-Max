import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { formatMonthLabel, currentYearMonth, buildMonthId } from '@/utils'
import { Button } from '@/components/ui'

interface MonthNavigatorProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onGoToCurrent: () => void
}

export function MonthNavigator({ year, month, onPrev, onNext, onGoToCurrent }: MonthNavigatorProps) {
  const { year: cy, month: cm } = currentYearMonth()
  const isCurrentMonth = buildMonthId(year, month) === buildMonthId(cy, cm)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
      <button
        onClick={onPrev}
        aria-label="Mois précédent"
        className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-100 capitalize">
          {formatMonthLabel(year, month)}
        </span>
        {!isCurrentMonth && (
          <button
            onClick={onGoToCurrent}
            aria-label="Revenir au mois actuel"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CalendarDays size={15} />
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        aria-label="Mois suivant"
        className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
