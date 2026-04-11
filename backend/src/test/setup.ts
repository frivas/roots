// Stub env vars BEFORE any backend module loads.
// This runs via vitest.config.ts setupFiles so it precedes every test import.
process.env.PORT = '3000';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_xxx';
process.env.CLERK_SECRET_KEY = 'sk_test_xxx';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_API_KEY = 'test-anon-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.FRONTEND_URL = 'http://localhost:5173';

console.debug('[test setup] Backend env vars stubbed');
