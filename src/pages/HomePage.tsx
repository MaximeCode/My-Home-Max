import { useNavigate } from 'react-router-dom'
import { Wallet, CheckSquare, ShoppingCart, type LucideIcon } from 'lucide-react'
import { budgetStorage, todoStorage, groceriesStorage } from '@/storage'
import { formatCurrency, currentYearMonth, buildMonthId } from '@/utils'

// ─── Données de résumé par module ─────────────────────────────────────────────

function useBudgetSummary(): string {
  const { year, month } = currentYearMonth()
  const monthId = buildMonthId(year, month)
  const months = budgetStorage.getMonths()
  const current = months.find((m) => m.id === monthId)
  if (!current) return 'Aucune donnée ce mois'
  const total = current.expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = current.budget - total
  return `Reste : ${formatCurrency(remaining)}`
}

function useTodoSummary(): string {
  const tasks = todoStorage.getTasks()
  const active = tasks.filter((t) => t.status !== 'done').length
  if (active === 0) return 'Toutes les tâches sont faites'
  return `${active} tâche${active > 1 ? 's' : ''} en cours`
}

function useCoursesSummary(): string {
  const items = groceriesStorage.getItems()
  const remaining = items.filter((i) => !i.bought).length
  if (items.length === 0) return 'Liste vide'
  if (remaining === 0) return 'Tout est acheté !'
  return `${remaining} article${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
}

// ─── Card de navigation ───────────────────────────────────────────────────────

interface NavCardProps {
  icon: LucideIcon
  label: string
  description: string
  summary: string
  iconColor: string
  iconBg: string
  to: string
}

function NavCard({ icon: Icon, label, description, summary, iconColor, iconBg, to }: NavCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="w-full text-left bg-slate-900 border border-slate-800 rounded-2xl p-5
        active:scale-[0.98] transition-transform hover:border-slate-700"
    >
      <div className="flex items-start gap-4">
        {/* Icône */}
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-100">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          <p className="text-sm text-slate-300 mt-2 font-medium">{summary}</p>
        </div>
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const budgetSummary = useBudgetSummary()
  const todoSummary = useTodoSummary()
  const coursesSummary = useCoursesSummary()

  return (
    <div className="flex flex-col h-dvh max-w-107.5 mx-auto bg-slate-950">
      {/* Header sans bouton retour */}
      <header className="px-4 py-5 shrink-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
          My Home Max
        </p>
        <h1 className="text-2xl font-bold text-slate-100">Bonjour, Max</h1>
      </header>

      {/* Cards */}
      <main className="flex-1 px-4 pb-8 flex flex-col gap-3 overflow-y-auto">
        <NavCard
          to="/budget"
          icon={Wallet}
          label="Budget"
          description="Dépenses du mois, totaux, reste à payer"
          summary={budgetSummary}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <NavCard
          to="/todo"
          icon={CheckSquare}
          label="To-do list"
          description="Tâches, groupes et rappels"
          summary={todoSummary}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <NavCard
          to="/courses"
          icon={ShoppingCart}
          label="Courses"
          description="Liste de courses par catégorie"
          summary={coursesSummary}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/10"
        />
      </main>
    </div>
  )
}
