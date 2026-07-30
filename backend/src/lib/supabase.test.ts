import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.hoisted(() => vi.fn(() => ({ from: vi.fn() })));

vi.mock('@supabase/supabase-js', () => ({ createClient }));

import { createRequestSupabase, createTrustedSupabase } from './supabase.js';

describe('Supabase client factories', () => {
  beforeEach(() => {
    createClient.mockClear();
  });

  it('passes the Clerk session token provider to a per-request public client', async () => {
    const getToken = vi.fn(async () => 'clerk-token');
    createRequestSupabase(getToken, {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'sb_publishable_test',
      expect.objectContaining({ accessToken: getToken }),
    );
  });

  it('rejects a secret key in a user-request client', () => {
    expect(() =>
      createRequestSupabase(async () => 'clerk-token', {
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'sb_secret_forbidden',
      }),
    ).toThrow(/cannot be used for user requests/);
  });

  it('requires a dedicated secret for trusted webhook processing', () => {
    expect(() =>
      createTrustedSupabase({
        SUPABASE_URL: 'https://project.supabase.co',
      }),
    ).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it('creates the trusted client without a user access-token callback', () => {
    createTrustedSupabase({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_server_only',
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'sb_secret_server_only',
      expect.not.objectContaining({ accessToken: expect.anything() }),
    );
  });
});
