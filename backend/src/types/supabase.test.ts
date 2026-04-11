import { describe, it, expect } from 'vitest';

describe('supabase types module', () => {
  it('imports without throwing', async () => {
    await expect(import('./supabase.js')).resolves.toBeDefined();
  });
});
