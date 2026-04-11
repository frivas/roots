// Stub all required environment variables for tests
process.env.PORT = process.env.PORT ?? '3001';
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY ?? 'pk_test_stub';
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? 'sk_test_stub';
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://stub.supabase.co';
process.env.SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? 'stub-api-key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'sk-stub-openai';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
