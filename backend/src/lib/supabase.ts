import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.js';

type TokenProvider = () => Promise<string | null>;

const statelessAuth = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  persistSession: false,
} as const;

const getSupabaseUrl = (env: NodeJS.ProcessEnv) => {
  const url = env.SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL must be set');
  }
  return url;
};
const decodeJwtRole = (key: string): string | null => {
  const payload = key.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(
      Buffer.from(normalized, 'base64').toString('utf8'),
    ) as { role?: unknown };
    return typeof decoded.role === 'string' ? decoded.role : null;
  } catch {
    return null;
  }
};

const getPublishableKey = (env: NodeJS.ProcessEnv) => {
  const key = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_API_KEY;
  if (!key) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY must be set');
  }
  if (key.startsWith('sb_secret_') || decodeJwtRole(key) === 'service_role') {
    throw new Error('A Supabase secret/service-role key cannot be used for user requests');
  }
  return key;
};

export const createRequestSupabase = (
  accessToken: TokenProvider,
  env: NodeJS.ProcessEnv = process.env,
): SupabaseClient<Database> =>
  createClient<Database>(getSupabaseUrl(env), getPublishableKey(env), {
    accessToken,
    auth: statelessAuth,
  });

export const createTrustedSupabase = (
  env: NodeJS.ProcessEnv = process.env,
): SupabaseClient<Database> => {
  const secretKey = env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY must be set for trusted webhook processing',
    );
  }

  return createClient<Database>(getSupabaseUrl(env), secretKey, {
    auth: statelessAuth,
  });
};
