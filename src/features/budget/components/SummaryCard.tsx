import { formatCurrency } from '@/utils'
import type { BudgetSummary } from '../types'

interface SummaryCardProps {
  budget: number
  summary: BudgetSummary
}

interface StatItemProps {
  label: string
  value: number
  highlight?: 'green' | 'orange' | 'red' | 'default'
  small?: boolean
}

function StatItem({ label, value, highlight = 'default', small = false }: StatItemProps) {
  const colorMap = {
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    default: 'text-slate-100',
  }
  const valueColor = value < 0 ? 'text-red-400' : colorMap[highlight]

  return (
    <div className={`flex flex-col gap-0.5 ${small ? '' : ''}`}>
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`font-semibold tabular-nums ${small ? 'text-sm' : 'text-base'} ${valueColor}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

export function SummaryCard({ budget, summary }: SummaryCardProps) {
  return (
    <div className="mx-4 my-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Budget mensuel */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-sm text-slate-400">Budget du mois</span>
        <span className="text-base font-bold text-slate-100 tabular-nums">
          {formatCurrency(budget)}
        </span>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-px bg-slate-800">
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="Total" value={summary.totalAll} />
        </div>
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="Obligatoire" value={summary.totalObligatoire} highlight="orange" />
        </div>
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="Facultatif" value={summary.totalFacultatif} />
        </div>
      </div>

      {/* Restes */}
      <div className="grid grid-cols-3 gap-px bg-slate-800">
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="Reste total" value={summary.resteAll} highlight="green" />
        </div>
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="Après oblig." value={summary.resteApresObligatoire} highlight="green" />
        </div>
        <div className="bg-slate-900 px-3 py-3">
          <StatItem label="À payer" value={summary.resteAPayer} highlight="red" />
        </div>
      </div>
    </div>
  )
}
