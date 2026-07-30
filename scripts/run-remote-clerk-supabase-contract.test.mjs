import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('run-remote-clerk-supabase-contract.mjs', import.meta.url).pathname;
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const subject = 'user_contract';
const controlSubject = 'user_control';
const token = (overrides = {}) => [
  encode({ alg: 'RS256', typ: 'JWT' }),
  encode({
    iss: 'https://clerk.example.test',
    sub: subject,
    exp: Math.floor(Date.now() / 1_000) + 600,
    ...overrides,
  }),
  'test-signature',
].join('.');

const run = async (tokenValue = token()) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(
      request.headers.apikey === 'secret-test-key'
        ? [{ id: controlSubject }, { id: subject }]
        : [{ id: subject }],
    ));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const directory = mkdtempSync(join(tmpdir(), 'roots-remote-contract-'));
  const evidenceFile = join(directory, 'evidence.json');
  const address = server.address();
  const env = {
    ...process.env,
    SUPABASE_URL: `http://127.0.0.1:${address.port}`,
    SUPABASE_PUBLISHABLE_KEY: 'publishable-test-key',
    SUPABASE_SECRET_KEY: 'secret-test-key',
    CLERK_SUPABASE_TEST_TOKEN: tokenValue,
    CLERK_SUPABASE_TEST_SUBJECT: subject,
    CLERK_SUPABASE_CONTROL_SUBJECT: controlSubject,
    CLERK_SUPABASE_TEST_ISSUER: 'https://clerk.example.test',
    REMOTE_CONTRACT_EVIDENCE_FILE: evidenceFile,
    ALLOW_INSECURE_REMOTE_CONTRACT_FOR_TESTS: '1',
  };
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { env });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stderr }));
  });
  await new Promise((resolve) => server.close(resolve));
  return { ...result, evidenceFile };
};

test('records sanitized evidence for a fresh Clerk-issued token', async () => {
  const result = await run();
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(readFileSync(result.evidenceFile, 'utf8'));
  assert.equal(evidence.clerk.subject, subject);
  assert.equal(evidence.supabase.visibleUserIds[0], subject);
  assert.equal(JSON.stringify(evidence).includes('test-signature'), false);
  assert.equal(JSON.stringify(evidence).includes('secret-test-key'), false);
});

test('fails closed for an expired Clerk token', async () => {
  const result = await run(token({ exp: Math.floor(Date.now() / 1_000) - 1 }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /remain valid/);
});
