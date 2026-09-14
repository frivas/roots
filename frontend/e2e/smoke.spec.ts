import { test, expect } from '@playwright/test';

test('loads the app without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole('heading', { name: 'Raíces' }).first()).toBeVisible();
  expect(errors).toHaveLength(0);
});

test('renders privacy policy page without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/privacy-policy');
  await expect(
    page.getByRole('heading', { name: /privacy policy|política de privacidad/i }).first(),
  ).toBeVisible();
  expect(errors).toHaveLength(0);
});

test('renders NotFound for unknown route', async ({ page }) => {
  await page.goto('/definitely-not-a-real-route-xyz');
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole('heading', { name: 'Raíces' }).first()).toBeVisible();
});
