import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface LayoutProps {
  title: string
  children: ReactNode
  /** Action optionnelle dans le coin droit du header */
  headerRight?: ReactNode
  /** Si true, affiche le bouton retour (défaut : true) */
  showBack?: boolean
}

/**
 * Layout commun à toutes les pages de module.
 * Header fixe + zone de contenu scrollable.
 */
export function Layout({ title, children, headerRight, showBack = true }: LayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-dvh max-w-107.5 mx-auto bg-slate-950">
      {/* Header fixe */}
      <header className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-slate-100 truncate">{title}</h1>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </header>

      {/* Contenu scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-contain page-enter">
        {children}
      </main>
    </div>
  )
}
