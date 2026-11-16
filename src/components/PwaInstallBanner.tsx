import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'

/**
 * Bandeau d'installation PWA affiché en bas de la HomePage.
 * Apparaît uniquement quand le navigateur expose le prompt d'installation
 * (Android Chrome, non installé, non dismissé dans cette session).
 */
export function PwaInstallBanner() {
  const { canInstall, install } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  async function handleInstall() {
    const accepted = await install()
    if (!accepted) setDismissed(true)
  }

  return (
    <div className="mx-4 mb-4 flex items-center gap-3 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl px-4 py-3">
      <Download size={18} className="text-indigo-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">Installer MaxTools</p>
        <p className="text-xs text-slate-400">Accès rapide depuis l'écran d'accueil</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
      >
        Installer
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className="shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
