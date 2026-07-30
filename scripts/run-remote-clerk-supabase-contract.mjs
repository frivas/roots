import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const decodePayload = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('CLERK_SUPABASE_TEST_TOKEN must be a JWT');
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new Error('CLERK_SUPABASE_TEST_TOKEN payload must be valid JSON');
  }
};

const supabaseUrl = new URL(required('SUPABASE_URL'));
if (
  supabaseUrl.protocol !== 'https:' &&
  !(process.env.ALLOW_INSECURE_REMOTE_CONTRACT_FOR_TESTS === '1' &&
    ['127.0.0.1', 'localhost'].includes(supabaseUrl.hostname))
) {
  throw new Error('SUPABASE_URL must use HTTPS');
}

const publishableKey = required('SUPABASE_PUBLISHABLE_KEY');
const secretKey = required('SUPABASE_SECRET_KEY');
const token = required('CLERK_SUPABASE_TEST_TOKEN');
const expectedSubject = required('CLERK_SUPABASE_TEST_SUBJECT');
const controlSubject = required('CLERK_SUPABASE_CONTROL_SUBJECT');
if (controlSubject === expectedSubject) {
  throw new Error('CLERK_SUPABASE_CONTROL_SUBJECT must differ from the test subject');
}
const payload = decodePayload(token);
const nowSeconds = Math.floor(Date.now() / 1_000);

if (payload.sub !== expectedSubject) {
  throw new Error('Clerk token subject does not match CLERK_SUPABASE_TEST_SUBJECT');
}
if (!Number.isInteger(payload.exp) || payload.exp <= nowSeconds + 60) {
  throw new Error('Clerk token must remain valid for at least 60 seconds');
}
let issuer;
try {
  issuer = new URL(payload.iss);
} catch {
  throw new Error('Clerk token must contain a valid issuer URL');
}
if (issuer.protocol !== 'https:') {
  throw new Error('Clerk token issuer must use HTTPS');
}
const expectedIssuer = new URL(required('CLERK_SUPABASE_TEST_ISSUER'));
if (issuer.origin !== expectedIssuer.origin) {
  throw new Error('Clerk token issuer does not match CLERK_SUPABASE_TEST_ISSUER');
}

const usersUrl = new URL('/rest/v1/users', supabaseUrl);
usersUrl.searchParams.set('select', 'id');
usersUrl.searchParams.set('id', `in.(${expectedSubject},${controlSubject})`);
usersUrl.searchParams.set('order', 'id');
const controlResponse = await fetch(usersUrl, {
  headers: {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    accept: 'application/json',
  },
  redirect: 'error',
  signal: AbortSignal.timeout(10_000),
});
if (!controlResponse.ok) {
  throw new Error(`remote Supabase control query returned HTTP ${controlResponse.status}`);
}
const controlRows = await controlResponse.json();
if (
  !Array.isArray(controlRows) ||
  controlRows.length !== 2 ||
  ![expectedSubject, controlSubject].every(
    (subject) => controlRows.some((row) => row?.id === subject),
  )
) {
  throw new Error('remote Supabase control query must prove both contract users exist');
}

const response = await fetch(usersUrl, {
  headers: {
    apikey: publishableKey,
    authorization: `Bearer ${token}`,
    accept: 'application/json',
  },
  redirect: 'error',
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) {
  throw new Error(`remote Supabase Clerk token contract returned HTTP ${response.status}`);
}
const rows = await response.json();
if (
  !Array.isArray(rows) ||
  rows.length !== 1 ||
  rows[0]?.id !== expectedSubject
) {
  throw new Error('remote Supabase RLS did not expose exactly the Clerk subject row');
}

const evidenceFile = resolve(
  process.env.REMOTE_CONTRACT_EVIDENCE_FILE ||
    'contract-evidence/remote-clerk-issued-token.json',
);
mkdirSync(dirname(evidenceFile), { recursive: true });
writeFileSync(evidenceFile, `${JSON.stringify({
  schemaVersion: 1,
  collectedAt: new Date().toISOString(),
  contract: 'remote-clerk-issued-token-to-supabase-rls',
  clerk: {
    issuer: issuer.origin,
    subject: expectedSubject,
    expiresAt: new Date(payload.exp * 1_000).toISOString(),
  },
  supabase: {
    origin: supabaseUrl.origin,
    controlUserProven: true,
    visibleUserIds: rows.map((row) => row.id),
  },
  source: {
    repository: process.env.GITHUB_REPOSITORY ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    workflowRef: process.env.GITHUB_WORKFLOW_REF ?? null,
  },
}, null, 2)}\n`);

console.log('Verified a fresh Clerk-issued token through remote Supabase RLS.');
