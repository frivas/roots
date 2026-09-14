import { test, expect } from '@playwright/test';

test('privacy policy page loads and has content', async ({ page }) => {
  await page.goto('/privacy-policy');
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await expect(
    page.getByRole('heading', { name: /privacy policy|política de privacidad/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/personal data|datos personales/i).first()).toBeVisible();
});
