import { test, expect } from '@playwright/test';

test('loads the app without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // The app will redirect to auth/login if not signed in — that's fine
  // Just verify no unhandled runtime errors
  expect(errors.filter(e => !e.includes('ClerkJS') && !e.includes('clerk'))).toHaveLength(0);
});

test('renders privacy policy page without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/privacy-policy');
  // Should render even without auth
  await page.waitForLoadState('networkidle');
  expect(errors.filter(e => !e.includes('ClerkJS') && !e.includes('clerk'))).toHaveLength(0);
});

test('renders NotFound for unknown route', async ({ page }) => {
  await page.goto('/definitely-not-a-real-route-xyz');
  await page.waitForLoadState('domcontentloaded');
  // Should not crash — either renders 404 or redirects to auth
  const title = await page.title();
  expect(title).toBeTruthy();
});
