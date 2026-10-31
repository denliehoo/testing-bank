import { expect, test } from '@playwright/test'

// The one flow the app exists for, in a real browser against the production
// build: the mock API runs in the service worker, as on the deployed site.
test('sends a transfer and the dashboard reflects it', async ({ page }) => {
  // The brief asks for no console errors when the app works normally.
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => problems.push(`exception: ${error.message}`))

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Good evening, Ava' }),
  ).toBeVisible()
  await expect(page.getByText('SGD 4,280.55')).toBeVisible()

  // Step 1: recipient
  await page.getByRole('button', { name: 'New transfer' }).click()
  const dialog = page.getByRole('dialog', { name: 'New transfer' })
  await dialog.getByRole('radio', { name: /Jamie Tan/ }).check()
  await dialog.getByRole('button', { name: 'Continue' }).click()

  // Step 2: amount
  await dialog.getByLabel('Amount (SGD)').fill('120')
  await dialog.getByLabel(/Note/).fill('Dinner')
  await dialog.getByRole('button', { name: 'Continue' }).click()

  // Step 3: review, then send
  await expect(
    dialog.getByRole('heading', { name: 'Check the details' }),
  ).toBeVisible()
  await expect(dialog.getByText('Jamie Tan · DBS')).toBeVisible()
  await dialog.getByRole('button', { name: 'Confirm transfer' }).click()

  // Success, with the reference from the API
  await expect(dialog.getByText('Transfer sent')).toBeVisible()
  await expect(dialog.getByText('SGD 120.00')).toBeVisible()
  await expect(dialog.getByText(/TRF-/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Back to dashboard' }).click()
  await expect(dialog).toBeHidden()

  // The dashboard has caught up without a reload
  await expect(page.getByText('SGD 4,160.55')).toBeVisible()
  await expect(page.getByText('Transfer to Jamie Tan')).toBeVisible()
  await expect(page.getByText('SGD 4,880.00')).toBeVisible()

  expect(problems).toEqual([])
})
