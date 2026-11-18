import { test, expect, openCleanTodo } from '../fixtures/todo.fixture'
import { shotFilledForm } from '../helpers/screenshots'
import { DEMO, daysFromNow } from '../helpers/storage'
import {
  confirmDeleteButton,
  createGroup,
  fillTaskForm,
  groupHeader,
  openTaskFormViaFab,
  taskRow,
} from '../helpers/todo-actions'

/**
 * Parcours bout-en-bout filmé (video: on dans playwright.config).
 * Screenshots des forms remplis avant chaque submit.
 */
test.describe('To-do — parcours CRUD filmé', () => {
  test('flow complet groupes + tâches', async ({ page }) => {
    await openCleanTodo(page)

    await test.step('État vide', async () => {
      await expect(page.getByText('Aucun groupe de tâches')).toBeVisible()
    })

    await test.step('Créer le groupe Maison', async () => {
      await createGroup(page, DEMO.groupName, 'todo-flow-group-create-filled')
      await expect(page.getByText(DEMO.groupName, { exact: true })).toBeVisible()
    })

    await test.step('Créer une tâche complète', async () => {
      const dueDate = daysFromNow(7)
      await openTaskFormViaFab(page)
      await fillTaskForm(page, {
        title: DEMO.taskTitle,
        description: DEMO.taskDescription,
        priority: DEMO.priority,
        status: DEMO.status,
        dueDate,
        dueTime: DEMO.dueTime,
      })
      await shotFilledForm(page, 'todo-flow-task-create-filled')
      await page.getByRole('button', { name: 'Ajouter la tâche' }).click()
      await expect(page.getByText(DEMO.taskTitle, { exact: true })).toBeVisible()
    })

    await test.step('Éditer la tâche', async () => {
      await taskRow(page, DEMO.taskTitle).getByRole('button', { name: 'Modifier' }).click()
      await expect(page.getByRole('dialog', { name: 'Modifier la tâche' })).toBeVisible()
      await fillTaskForm(page, {
        title: DEMO.taskTitleEdited,
        priority: 'Urgente',
        status: 'À faire',
      })
      await shotFilledForm(page, 'todo-flow-task-edit-filled')
      await page.getByRole('button', { name: 'Enregistrer' }).click()
      await expect(page.getByText(DEMO.taskTitleEdited, { exact: true })).toBeVisible()
      await expect(page.getByText('Urgente')).toBeVisible()
    })

    await test.step('Marquer terminée', async () => {
      await taskRow(page, DEMO.taskTitleEdited)
        .getByRole('button', { name: 'Marquer comme terminée' })
        .click()
      await expect(page.getByText('1 terminée')).toBeVisible()
    })

    await test.step('Créer un 2ᵉ groupe et une tâche', async () => {
      await page.getByRole('button', { name: 'Nouveau groupe' }).click()
      await page.getByLabel('Nom du groupe').fill(DEMO.groupNameAlt)
      await shotFilledForm(page, 'todo-flow-group2-create-filled')
      await page.getByRole('button', { name: 'Créer le groupe' }).click()
      await expect(page.getByText(DEMO.groupNameAlt, { exact: true })).toBeVisible()

      await groupHeader(page, DEMO.groupNameAlt)
        .getByRole('button', { name: 'Ajouter une tâche' })
        .click()
      await fillTaskForm(page, {
        title: 'Acheter du pain',
        description: 'Boulangerie du coin',
        priority: 'Normale',
      })
      await shotFilledForm(page, 'todo-flow-task2-create-filled')
      await page.getByRole('button', { name: 'Ajouter la tâche' }).click()
      await expect(page.getByText('Acheter du pain', { exact: true })).toBeVisible()
    })

    await test.step('Supprimer la 2ᵉ tâche puis le 2ᵉ groupe', async () => {
      await taskRow(page, 'Acheter du pain')
        .getByRole('button', { name: 'Supprimer', exact: true })
        .click()
      await confirmDeleteButton(page).click()
      await expect(page.getByText('Acheter du pain')).toHaveCount(0)

      await groupHeader(page, DEMO.groupNameAlt)
        .getByRole('button', { name: 'Supprimer le groupe' })
        .click()
      await confirmDeleteButton(page).click()
      await expect(page.getByText(DEMO.groupNameAlt, { exact: true })).toHaveCount(0)
      await expect(page.getByText(DEMO.groupName, { exact: true })).toBeVisible()
    })
  })
})
