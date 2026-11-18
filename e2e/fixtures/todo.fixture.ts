import { test as base, expect, type Page } from '@playwright/test'
import { clearTodoStorage, seedTodo, stubNotifications, type SeedGroup, type SeedTask } from '../helpers/storage'

type TodoFixtures = {
  todoPage: Page
}

async function openCleanTodo(page: Page): Promise<void> {
  await stubNotifications(page)
  await page.goto('/todo')
  await clearTodoStorage(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'To-do list' })).toBeVisible()
}

async function openSeededTodo(
  page: Page,
  data: { groups?: SeedGroup[]; tasks?: SeedTask[] },
): Promise<void> {
  await stubNotifications(page)
  await page.goto('/todo')
  await seedTodo(page, data)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'To-do list' })).toBeVisible()
}

export const test = base.extend<TodoFixtures>({
  todoPage: async ({ page }, use) => {
    await openCleanTodo(page)
    await use(page)
  },
})

export { expect, openCleanTodo, openSeededTodo }
