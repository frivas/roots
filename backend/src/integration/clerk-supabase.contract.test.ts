import { createHmac, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { createRequestSupabase } from '../lib/supabase.js';
import { SupabaseDataRepository } from '../repositories/supabase-repository.js';
import type { Database } from '../types/supabase.js';

const enabled = process.env.RUN_SUPABASE_CONTRACT_TESTS === '1';

const parseStatus = () => {
  const output = execFileSync(
    'supabase',
    ['status', '--workdir', '..', '-o', 'env'],
    { encoding: 'utf8' },
  );
  return Object.fromEntries(
    output
      .split('\n')
      .map((line) => line.match(/^([A-Z_]+)="(.*)"$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => [match[1], match[2]]),
  );
};

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const clerkShapedToken = (secret: string, subject: string) => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1_000) + 300,
    iat: Math.floor(Date.now() / 1_000),
    role: 'authenticated',
    sub: subject,
  });
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
};

describe.skipIf(!enabled)('Clerk/Supabase local contract', () => {
  it('passes a Clerk-shaped string subject through the request client into RLS', async ({
    skip,
  }) => {
    let local: Record<string, string>;
    try {
      local = parseStatus();
    } catch {
      skip(
        'Local Supabase stack is unavailable; run `supabase start` before enabling this contract.',
      );
      return;
    }

    const apiUrl = local.API_URL;
    const anonKey = local.ANON_KEY;
    const serviceRoleKey = local.SERVICE_ROLE_KEY;
    const jwtSecret = local.JWT_SECRET;
    if (!apiUrl || !anonKey || !serviceRoleKey || !jwtSecret) {
      skip('Local Supabase status did not expose the required contract values.');
      return;
    }

    const firstUser = `user_clerk_${randomUUID()}`;
    const secondUser = `user_clerk_${randomUUID()}`;
    const firstToken = clerkShapedToken(jwtSecret, firstUser);
    const secondToken = clerkShapedToken(jwtSecret, secondUser);
    const originalUrl = process.env.SUPABASE_URL;
    const originalPublishable = process.env.SUPABASE_PUBLISHABLE_KEY;
    const originalApiKey = process.env.SUPABASE_API_KEY;

    process.env.SUPABASE_URL = apiUrl;
    process.env.SUPABASE_PUBLISHABLE_KEY = anonKey;
    delete process.env.SUPABASE_API_KEY;

    try {
      const firstRepository = new SupabaseDataRepository(
        createRequestSupabase(async () => firstToken),
        firstUser,
      );
      const secondClient = createRequestSupabase(async () => secondToken);
      const secondRepository = new SupabaseDataRepository(
        secondClient,
        secondUser,
      );

      expect((await firstRepository.getCurrentUser()).id).toBe(firstUser);
      expect((await secondRepository.getCurrentUser()).id).toBe(secondUser);
      await firstRepository.updateSettings({ language: 'Spanish' });

      const { data, error } = await secondClient
        .from('settings')
        .select('user_id, language')
        .eq('user_id', firstUser);
      expect(error).toBeNull();
      expect(data).toEqual([]);
    } finally {
      const admin = createClient<Database>(apiUrl, serviceRoleKey);
      await admin.from('settings').delete().in('user_id', [firstUser, secondUser]);
      await admin.from('users').delete().in('id', [firstUser, secondUser]);
      if (originalUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = originalUrl;
      if (originalPublishable === undefined) {
        delete process.env.SUPABASE_PUBLISHABLE_KEY;
      } else {
        process.env.SUPABASE_PUBLISHABLE_KEY = originalPublishable;
      }
      if (originalApiKey === undefined) delete process.env.SUPABASE_API_KEY;
      else process.env.SUPABASE_API_KEY = originalApiKey;
    }
  });
});
