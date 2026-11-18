import path from 'node:path'
import type { Locator, Page } from '@playwright/test'

const SCREENSHOT_DIR = path.join('test-results', 'screenshots')

/**
 * Capture le formulaire (BottomSheet) rempli, avant le clic submit.
 */
export async function shotFilledForm(
  page: Page,
  name: string,
  options?: { locator?: Locator },
): Promise<void> {
  const target = options?.locator ?? page.getByRole('dialog')
  await target.waitFor({ state: 'visible' })
  await page.waitForTimeout(200)
  await target.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
  })
}
