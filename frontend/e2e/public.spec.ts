import { test, expect } from '@playwright/test';

test('privacy policy page loads and has content', async ({ page }) => {
  await page.goto('/privacy-policy');
  await page.waitForLoadState('networkidle');
  // Page should have some text content
  const bodyText = await page.textContent('body');
  expect(bodyText?.length).toBeGreaterThan(10);
});
