import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('createSupabase', () => {
  beforeEach(() => { vi.resetModules(); });

  it('calls createClient with URL and key from env', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = vi.fn(() => ({} as any));
    vi.doMock('@supabase/supabase-js', () => ({ createClient: spy }));
    const { createSupabase } = await import('./supabase.js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createSupabase({ SUPABASE_URL: 'https://u.co', SUPABASE_API_KEY: 'k' } as any);
    expect(spy).toHaveBeenCalledWith('https://u.co', 'k');
  });

  it('throws when SUPABASE_URL is missing', async () => {
    const { createSupabase } = await import('./supabase.js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => createSupabase({ SUPABASE_API_KEY: 'k' } as any)).toThrow();
  });

  it('throws when SUPABASE_API_KEY is missing', async () => {
    const { createSupabase } = await import('./supabase.js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => createSupabase({ SUPABASE_URL: 'https://u.co' } as any)).toThrow();
  });
});
