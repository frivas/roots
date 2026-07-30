import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for real Clerk E2E`);
  return value;
};

const emailAddress =
  `roots+clerk_test_${Date.now()}@example.com`;
const username = `roots_e2e_${Date.now()}`;
const password = `R00ts!Clerk_${Date.now()}_Z9`;
let clerkClient: ClerkClient;
let userId: string | undefined;

test.beforeAll(async () => {
  const publishableKey = required('CLERK_PUBLISHABLE_KEY');
  const secretKey = required('CLERK_SECRET_KEY');
  if (!publishableKey.startsWith('pk_test_') || !secretKey.startsWith('sk_test_')) {
    throw new Error('Real Clerk E2E requires a development Clerk instance');
  }

  await clerkSetup({ publishableKey, secretKey });
  clerkClient = createClerkClient({ secretKey });
  const user = await clerkClient.users.createUser({
    emailAddress: [emailAddress],
    username,
    password,
    firstName: 'Roots',
    lastName: 'E2E',
    publicMetadata: {
      role: 'parent',
      roles: ['parent'],
    },
  });
  userId = user.id;
});

test.afterAll(async () => {
  if (userId) {
    await clerkClient.users.deleteUser(userId);
  }
});

test('signs in a real Clerk test identity and resolves protected role state', async ({
  page,
}) => {
  await page.goto('/auth/login');
  await clerk.signIn({ page, emailAddress });
  await page.goto('/home');

  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole('heading', { name: /welcome to raíces/i }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const clerk = (window as typeof window & {
          Clerk?: {
            user?: {
              publicMetadata?: { roles?: unknown };
            };
          };
        }).Clerk;
        return clerk?.user?.publicMetadata?.roles;
      }),
    )
    .toEqual(['parent']);

  await clerk.signOut({ page });
  await page.goto('/home');
  await expect(page).toHaveURL(/\/auth\/login$/);
});
