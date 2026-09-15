import { test, expect } from '@playwright/test';

test('storytelling session route does not crash the production preview', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/services/storytelling-session');
  await page.waitForLoadState('domcontentloaded');
  expect(
    errors.filter((e) => !e.includes('ClerkJS') && !e.includes('clerk') && !e.includes('crypto')),
  ).toHaveLength(0);
});

test('production preview does not render contributor stats at /data/contributions', async ({ page }) => {
  await page.goto('/data/contributions');
  await page.waitForLoadState('networkidle');
  const bodyText = await page.textContent('body');
  expect(bodyText).not.toMatch(/Comprehensive analysis of project contributions/i);
  expect(bodyText).not.toMatch(/juan294@gmail\.com|franciscojrivash@gmail\.com/i);
  expect(bodyText).not.toMatch(/Contributor A|Developer Contribution/i);
});
