/**
 * Génère un identifiant unique simple basé sur timestamp + aléatoire.
 * Pas besoin d'une lib UUID pour ce projet.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Formate un montant en euros avec séparateur de milliers.
 * Ex. 1234.5 → "1 234,50 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formate une date ISO (YYYY-MM-DD) en date lisible française.
 * Ex. "2026-11-15" → "15 nov. 2026"
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

/**
 * Retourne l'identifiant d'un mois au format YYYY-MM.
 * Ex. (2026, 11) → "2026-11"
 */
export function buildMonthId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Retourne le nom long d'un mois en français avec l'année.
 * Ex. (2026, 11) → "Novembre 2026"
 */
export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

/**
 * Retourne { year, month } pour le mois courant.
 */
export function currentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/**
 * Navigue au mois précédent.
 */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

/**
 * Navigue au mois suivant.
 */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

/**
 * Vérifie si deux chaînes sont égales en ignorant la casse et les espaces.
 * Utilisé pour la détection de doublons dans la liste de courses.
 */
export function isSameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/**
 * Trie un tableau par une clé numérique `order` croissante.
 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}
