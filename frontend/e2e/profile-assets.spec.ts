import { expect, test } from '@playwright/test';

for (const profile of ['lucia-profile', 'sofia-profile']) {
  test(`${profile} serves compact modern image formats`, async ({ request }) => {
    for (const extension of ['avif', 'webp']) {
      const response = await request.get(`/images/${profile}.${extension}`);

      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain(`image/${extension}`);
      expect((await response.body()).byteLength).toBeLessThan(100_000);
    }
  });
}
