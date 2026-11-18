import type { Page } from '@playwright/test'
import { shotFilledForm } from './screenshots'
import { DEMO, daysFromNow } from './storage'

export async function openNewGroupForm(page: Page): Promise<void> {
  const emptyCta = page.getByRole('button', { name: 'Créer un groupe' })
  if (await emptyCta.isVisible().catch(() => false)) {
    await emptyCta.click()
  } else {
    await page.getByRole('button', { name: 'Nouveau groupe' }).click()
  }
  await page.getByRole('dialog', { name: 'Nouveau groupe' }).waitFor()
}

export async function fillGroupForm(page: Page, name: string): Promise<void> {
  await page.getByLabel('Nom du groupe').fill(name)
}

export async function createGroup(
  page: Page,
  name: string,
  screenshotName?: string,
): Promise<void> {
  await openNewGroupForm(page)
  await fillGroupForm(page, name)
  if (screenshotName) await shotFilledForm(page, screenshotName)
  await page.getByRole('button', { name: 'Créer le groupe' }).click()
  await page.getByRole('dialog', { name: 'Nouveau groupe' }).waitFor({ state: 'hidden' })
}

export async function openTaskFormViaFab(page: Page): Promise<void> {
  // FAB + bouton groupe partagent le même aria-label ; le FAB est le dernier en DOM.
  await page.getByRole('button', { name: 'Ajouter une tâche' }).last().click()
  await page.getByRole('dialog', { name: 'Nouvelle tâche' }).waitFor()
}

export function groupHeader(page: Page, groupName: string) {
  return page.locator('div.sticky').filter({ hasText: groupName })
}

export async function openTaskFormViaGroup(page: Page, groupName: string): Promise<void> {
  await groupHeader(page, groupName).getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByRole('dialog', { name: 'Nouvelle tâche' }).waitFor()
}

export interface TaskFormInput {
  title: string
  description?: string
  priority?: string
  status?: string
  dueDate?: string
  dueTime?: string
}

export async function fillTaskForm(page: Page, values: TaskFormInput): Promise<void> {
  await page.getByLabel('Titre', { exact: true }).fill(values.title)
  if (values.description !== undefined) {
    await page.getByLabel(/Description/).fill(values.description)
  }
  if (values.priority) {
    await page.getByLabel('Priorité').selectOption({ label: values.priority })
  }
  if (values.status) {
    await page.getByLabel('Statut').selectOption({ label: values.status })
  }
  if (values.dueDate) {
    await page.getByLabel('Date', { exact: true }).fill(values.dueDate)
  }
  if (values.dueTime) {
    await page.getByLabel('Heure', { exact: true }).fill(values.dueTime)
  }
}

export async function createDemoTask(
  page: Page,
  screenshotName: string,
  via: 'fab' | 'group' = 'fab',
): Promise<string> {
  const dueDate = daysFromNow(7)
  if (via === 'fab') await openTaskFormViaFab(page)
  else await openTaskFormViaGroup(page, DEMO.groupName)

  await fillTaskForm(page, {
    title: DEMO.taskTitle,
    description: DEMO.taskDescription,
    priority: DEMO.priority,
    status: DEMO.status,
    dueDate,
    dueTime: DEMO.dueTime,
  })
  await shotFilledForm(page, screenshotName)
  await page.getByRole('button', { name: 'Ajouter la tâche' }).click()
  await page.getByRole('dialog', { name: 'Nouvelle tâche' }).waitFor({ state: 'hidden' })
  return dueDate
}

/** Ligne tâche (évite de remonter jusqu’à l’en-tête de groupe). */
export function taskRow(page: Page, title: string) {
  return page
    .locator('div.flex.items-start')
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: 'Modifier', exact: true }) })
    .first()
}

/** Bouton danger du ConfirmDialog (texte exact, pas les aria-label « Supprimer … »). */
export function confirmDeleteButton(page: Page) {
  return page.locator('button').filter({ hasText: /^Supprimer$/ })
}
