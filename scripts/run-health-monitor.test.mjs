import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('run-health-monitor.mjs', import.meta.url).pathname;
const sha = 'e'.repeat(40);

const run = (env) => new Promise((resolve) => {
  const child = spawn(process.execPath, [script], { env: { ...process.env, ...env } });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('close', (status) => resolve({ status, stderr }));
});

test('writes structured evidence for matching healthy runtimes', async (context) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    response.setHeader('x-request-id', 'probe-request');
    if (request.url === '/release.json') {
      response.end(JSON.stringify({ schemaVersion: 1, commitSha: sha }));
    } else if (request.url === '/ready') {
      response.end(JSON.stringify({
        status: 'ready',
        mode: 'demo',
        releaseSha: sha,
        checks: { clerk: 'configured', openai: 'disabled', supabase: 'disabled' },
      }));
    } else {
      response.end('roots');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());
  const directory = mkdtempSync(join(tmpdir(), 'roots-health-'));
  const evidenceFile = join(directory, 'health.json');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const result = await run({
    FRONTEND_HEALTH_URL: baseUrl,
    BACKEND_HEALTH_URL: baseUrl,
    EXPECTED_RELEASE_SHA: sha,
    HEALTH_EVIDENCE_FILE: evidenceFile,
  });

  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(readFileSync(evidenceFile, 'utf8'));
  assert.equal(evidence.status, 'healthy');
  assert.equal(evidence.releaseSha, sha);
  assert.equal(evidence.backend.requestId, 'probe-request');
  assert.equal(evidence.backend.mode, 'demo');
  assert.deepEqual(evidence.backend.checks, {
    clerk: 'configured',
    openai: 'disabled',
    supabase: 'disabled',
  });
});

test('fails when either runtime does not report the expected release', async (context) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/release.json') {
      response.end(JSON.stringify({ schemaVersion: 1, commitSha: sha }));
    } else if (request.url === '/ready') {
      response.end(JSON.stringify({ status: 'ready', releaseSha: 'f'.repeat(40) }));
    } else {
      response.end('roots');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const result = await run({
    FRONTEND_HEALTH_URL: baseUrl,
    BACKEND_HEALTH_URL: baseUrl,
    EXPECTED_RELEASE_SHA: sha,
    HEALTH_EVIDENCE_FILE: join(mkdtempSync(join(tmpdir(), 'roots-health-')), 'health.json'),
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /release identity mismatch/);
});

test('fails closed when a backend dependency is unavailable', async (context) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/release.json') {
      response.end(JSON.stringify({ schemaVersion: 1, commitSha: sha }));
    } else if (request.url === '/ready') {
      response.statusCode = 503;
      response.end(JSON.stringify({
        status: 'unavailable',
        releaseSha: sha,
        checks: { clerk: 'configured', openai: 'configured', supabase: 'unavailable' },
      }));
    } else {
      response.end('roots');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const result = await run({
    FRONTEND_HEALTH_URL: baseUrl,
    BACKEND_HEALTH_URL: baseUrl,
    HEALTH_EVIDENCE_FILE: join(mkdtempSync(join(tmpdir(), 'roots-health-')), 'health.json'),
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\/ready returned HTTP 503/);
});
