import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_API_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);