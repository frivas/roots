import { test, expect } from '@playwright/test';

test('auth/login renders the Madrid sign-in experience', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: 'Raíces' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  await expect(page.getByText(/sign in|iniciar sesión/i).first()).toBeVisible();
});

test('auth/register renders the Madrid registration experience', async ({ page }) => {
  await page.goto('/auth/register');
  await expect(page.getByRole('heading', { name: 'Raíces' }).first()).toBeVisible();
  await expect(page.getByText(/sign up|create your account|crear cuenta/i).first()).toBeVisible();
});

test('language switcher changes the visible auth shell to Spanish', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: /change language|cambiar idioma/i }).first().click();

  await expect(
    page.getByRole('button', { name: /change language to english/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Iniciar sesión' }).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);
});
