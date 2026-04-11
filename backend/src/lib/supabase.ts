import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.js';

export const createSupabase = (env: NodeJS.ProcessEnv = process.env): SupabaseClient<Database> => {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_API_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_API_KEY must be set');
  }
  return createClient<Database>(url, key);
};

// Lazy default — re-uses module-level ergonomics for route files
let _default: SupabaseClient<Database> | null = null;
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    _default ??= createSupabase();
    return Reflect.get(_default as object, prop as string | symbol);
  },
});
