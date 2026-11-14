import { test, expect } from '@playwright/test'

// Skip the first-visit welcome so each test starts on the real page.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nkap-welcome-done', '1'))
})

test('a saved transfer survives a reload', async ({ page }) => {
  await page.goto('/sent-home')
  await page.getByLabel(/amount sent/i).fill('100')
  await page.getByLabel(/^fee/i).fill('1.20')
  await page.getByLabel(/recipient/i).fill('Maman')
  await page.getByRole('button', { name: /save transfer/i }).click()
  await expect(page.getByRole('status')).toContainText('64,809 XAF to Maman')

  await page.reload()
  await expect(page.getByRole('button', { name: /delete transfer to maman/i }).first()).toBeAttached()
})

test('the converter works offline on the EUR/XAF peg', async ({ page }) => {
  await page.route('**/api.frankfurter.dev/**', (route) => route.abort())
  await page.goto('/converter')
  // toHaveText (Playwright) retries until the animated number settles; toHaveTextContent is jest-dom only
  await expect(page.getByTestId('result')).toHaveText('65,596 XAF')
})

test('a deep link to an app page is served', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
})

test('unknown pages show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
})

test('the page makes no third-party requests except the rates API', async ({ page }) => {
  const hosts = new Set()
  page.on('request', (req) => hosts.add(new URL(req.url()).host))
  await page.goto('/')
  await page.goto('/converter')
  await page.waitForLoadState('networkidle')
  const foreign = [...hosts].filter((h) => h !== 'localhost:4173' && h !== 'api.frankfurter.dev')
  expect(foreign).toEqual([])
})
