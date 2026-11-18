import { test, expect, openCleanTodo, openSeededTodo } from '../fixtures/todo.fixture'
import { shotFilledForm } from '../helpers/screenshots'
import { DEMO, makeGroup, makeTask } from '../helpers/storage'
import {
  confirmDeleteButton,
  createGroup,
  fillGroupForm,
  openNewGroupForm,
} from '../helpers/todo-actions'

test.describe('To-do — groupes', () => {
  test('G1 — état vide initial', async ({ page }) => {
    await openCleanTodo(page)

    await expect(page.getByText('Aucun groupe de tâches')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Créer un groupe' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ajouter une tâche' })).toHaveCount(0)
  })

  test('G2 — créer un groupe', async ({ page }) => {
    await openCleanTodo(page)

    await createGroup(page, DEMO.groupName, 'todo-group-create-filled')

    await expect(page.getByText(DEMO.groupName, { exact: true })).toBeVisible()
    await expect(page.getByText('Aucune tâche dans ce groupe')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ajouter une tâche' }).last()).toBeVisible()
  })

  test('G3 — validation nom vide', async ({ page }) => {
    await openCleanTodo(page)

    await openNewGroupForm(page)
    await page.getByRole('button', { name: 'Créer le groupe' }).click()

    await expect(page.getByText('Nom requis')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Nouveau groupe' })).toBeVisible()
  })

  test('G4 — renommer un groupe', async ({ page }) => {
    await openSeededTodo(page, { groups: [makeGroup()], tasks: [] })

    await page.getByRole('button', { name: 'Renommer le groupe' }).click()
    await expect(page.getByRole('dialog', { name: 'Renommer le groupe' })).toBeVisible()

    await fillGroupForm(page, 'Maison & jardin')
    await shotFilledForm(page, 'todo-group-rename-filled')
    await page.getByRole('button', { name: 'Renommer', exact: true }).click()

    await expect(page.getByText('Maison & jardin', { exact: true })).toBeVisible()
    await expect(page.getByText(DEMO.groupName, { exact: true })).toHaveCount(0)
  })

  test('G5 — supprimer un groupe et ses tâches', async ({ page }) => {
    await openSeededTodo(page, {
      groups: [makeGroup()],
      tasks: [makeTask()],
    })

    await expect(page.getByText(DEMO.taskTitle)).toBeVisible()
    await page.getByRole('button', { name: 'Supprimer le groupe' }).click()

    await expect(page.getByRole('heading', { name: `Supprimer "${DEMO.groupName}" ?` })).toBeVisible()
    await confirmDeleteButton(page).click()

    await expect(page.getByText('Aucun groupe de tâches')).toBeVisible()
    await expect(page.getByText(DEMO.taskTitle)).toHaveCount(0)
  })
})
