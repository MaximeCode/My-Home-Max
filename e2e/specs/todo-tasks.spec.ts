import { test, expect, openSeededTodo } from '../fixtures/todo.fixture'
import { shotFilledForm } from '../helpers/screenshots'
import { DEMO, daysFromNow, makeGroup, makeTask } from '../helpers/storage'
import {
  confirmDeleteButton,
  createDemoTask,
  fillTaskForm,
  openTaskFormViaFab,
  openTaskFormViaGroup,
  taskRow,
} from '../helpers/todo-actions'

test.describe('To-do — tâches', () => {
  test.beforeEach(async ({ page }) => {
    await openSeededTodo(page, { groups: [makeGroup()], tasks: [] })
  })

  test('T1 — créer une tâche via FAB', async ({ page }) => {
    await createDemoTask(page, 'todo-task-create-fab-filled', 'fab')

    await expect(page.getByText(DEMO.taskTitle, { exact: true })).toBeVisible()
    await expect(page.getByText(DEMO.taskDescription)).toBeVisible()
    await expect(page.getByText(DEMO.priority)).toBeVisible()
  })

  test('T2 — créer une tâche via bouton groupe', async ({ page }) => {
    await openTaskFormViaGroup(page, DEMO.groupName)

    await expect(page.getByLabel('Groupe', { exact: true })).toHaveValue('group-maison')
    await fillTaskForm(page, {
      title: 'Sortir les poubelles',
      description: 'Tous les mardis',
    })
    await shotFilledForm(page, 'todo-task-create-group-filled')
    await page.getByRole('button', { name: 'Ajouter la tâche' }).click()

    await expect(page.getByText('Sortir les poubelles', { exact: true })).toBeVisible()
  })

  test('T3 — validation titre vide', async ({ page }) => {
    await openTaskFormViaFab(page)
    await page.getByRole('button', { name: 'Ajouter la tâche' }).click()

    await expect(page.getByText('Titre requis')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Nouvelle tâche' })).toBeVisible()
  })

  test('T4 — validation heure sans date', async ({ page }) => {
    await openTaskFormViaFab(page)
    await fillTaskForm(page, {
      title: 'Tâche invalide',
      dueDate: daysFromNow(3),
      dueTime: '10:00',
    })
    // Vider la date après avoir saisi l'heure (le champ heure se désactive, l'état React garde l'heure)
    await page.getByLabel('Date', { exact: true }).fill('')
    await page.getByRole('button', { name: 'Ajouter la tâche' }).click()

    await expect(page.getByText('Une heure nécessite une date')).toBeVisible()
  })

  test('T5 — éditer une tâche', async ({ page }) => {
    await openSeededTodo(page, {
      groups: [makeGroup()],
      tasks: [makeTask({ priority: 'normal', status: 'todo' })],
    })

    await taskRow(page, DEMO.taskTitle).getByRole('button', { name: 'Modifier' }).click()
    await expect(page.getByRole('dialog', { name: 'Modifier la tâche' })).toBeVisible()

    await fillTaskForm(page, {
      title: DEMO.taskTitleEdited,
      priority: DEMO.priority,
      status: DEMO.status,
    })
    await shotFilledForm(page, 'todo-task-edit-filled')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await expect(page.getByText(DEMO.taskTitleEdited, { exact: true })).toBeVisible()
    await expect(page.getByText(DEMO.priority)).toBeVisible()
  })

  test('T6 — marquer une tâche terminée', async ({ page }) => {
    await openSeededTodo(page, {
      groups: [makeGroup()],
      tasks: [makeTask()],
    })

    await taskRow(page, DEMO.taskTitle)
      .getByRole('button', { name: 'Marquer comme terminée' })
      .click()

    await expect(page.getByText('1 terminée')).toBeVisible()
    await page.getByRole('button', { name: /1 terminée/ }).click()
    await expect(page.getByText(DEMO.taskTitle, { exact: true })).toBeVisible()
  })

  test('T7 — supprimer une tâche', async ({ page }) => {
    await openSeededTodo(page, {
      groups: [makeGroup()],
      tasks: [makeTask()],
    })

    await taskRow(page, DEMO.taskTitle).getByRole('button', { name: 'Supprimer', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Supprimer la tâche ?' })).toBeVisible()
    await confirmDeleteButton(page).click()

    await expect(page.getByText(DEMO.taskTitle)).toHaveCount(0)
    await expect(page.getByText('Aucune tâche dans ce groupe')).toBeVisible()
  })

  test('T8 — tâche avec rappel date + heure', async ({ page }) => {
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

    await expect(page.getByText(`Notification à ${DEMO.dueTime} le jour J`)).toBeVisible()
    await shotFilledForm(page, 'todo-task-reminder-filled')
    await page.getByRole('button', { name: 'Ajouter la tâche' }).click()

    await expect(page.getByText(DEMO.taskTitle, { exact: true })).toBeVisible()
    await expect(page.getByText(new RegExp(`à ${DEMO.dueTime}`))).toBeVisible()
  })
})
