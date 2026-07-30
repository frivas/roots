# Clerk and Supabase integration evidence

The integration workflow contains three distinct contracts:

- `Local Clerk-shaped RLS contract` runs for relevant pull requests and pushes.
  It starts the local Supabase stack, exercises the SQL policies with injected
  Clerk-shaped claims, and runs the request client with locally signed JWTs.
  Those tokens are not issued by Clerk. The job validates the Vitest JSON and
  fails if the enabled contract test skipped.
- `Remote Clerk-issued-token contract` is an explicit manual option protected
  by the `integration` environment. It requires a fresh Clerk-issued token,
  verifies its subject, issuer, and expiry, proves both the test and control
  users exist through the Supabase secret key, and then proves the publishable
  client and Clerk token expose only the test subject through remote RLS.
- `Real Clerk browser auth contract` is a separate explicit manual option
  protected by the `integration` environment. It uses the Clerk development
  instance to create a disposable `+clerk_test` user, signs that identity into
  the built application, verifies protected navigation and parent role
  metadata, signs out, and deletes the user during suite teardown. The test
  rejects production Clerk keys.

The remote contract requires these protected values:

- Secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY`, and `CLERK_SUPABASE_TEST_TOKEN`.
- Variables: `CLERK_SUPABASE_TEST_SUBJECT`,
  `CLERK_SUPABASE_CONTROL_SUBJECT`, and `CLERK_SUPABASE_TEST_ISSUER`.

The browser auth contract requires the protected
`CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` secrets from the same Clerk
development instance. It does not accept production-prefixed keys, persist an
authenticated browser state, or upload secrets.

The Clerk token must remain valid for at least sixty seconds when the job
starts. Missing values, expired tokens, issuer or subject mismatch, missing
control rows, unexpected RLS visibility, and skipped local tests all fail
closed. Uploaded evidence excludes every key and token.
