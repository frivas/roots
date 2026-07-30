import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('run-deployed-canary.mjs', import.meta.url).pathname;
const sha = '1'.repeat(40);

test('records exact-SHA evidence from both deployed runtimes', async (context) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/release.json') {
      response.end(JSON.stringify({ schemaVersion: 1, commitSha: sha }));
    } else if (request.url === '/health') {
      response.end(JSON.stringify({ status: 'ok', releaseSha: sha }));
    } else {
      response.end(JSON.stringify({ application: 'roots' }));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());

  const directory = mkdtempSync(join(tmpdir(), 'roots-canary-'));
  const evidencePath = join(directory, 'release-evidence.json');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const env = {
    ...process.env,
    RELEASE_SHA: sha,
    NETLIFY_PRODUCTION_URL: baseUrl,
    VERCEL_PRODUCTION_URL: baseUrl,
    NETLIFY_SITE_ID: 'site-id',
    NETLIFY_DEPLOY_ID: 'frontend-current',
    NETLIFY_DEPLOYED_SHA: sha,
    NETLIFY_ROLLBACK_DEPLOY_ID: 'frontend-previous',
    VERCEL_PROJECT_ID: 'project-id',
    VERCEL_DEPLOYMENT_ID: 'backend-current',
    VERCEL_DEPLOYED_SHA: sha,
    VERCEL_ROLLBACK_DEPLOYMENT_ID: 'backend-previous',
    CANARY_SAMPLES: '3',
    RELEASE_EVIDENCE_FILE: evidencePath,
  };
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { env });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stderr }));
  });
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  assert.equal(evidence.releaseSha, sha);
  assert.equal(evidence.frontend.deployId, 'frontend-current');
  assert.equal(evidence.backend.deploymentId, 'backend-current');
  assert.equal(evidence.backend.runtimeReleaseSha, sha);
  assert.equal(evidence.frontend.latency.samples, 3);
  assert.equal(evidence.backend.latency.samples, 3);
});

test('rejects a backend runtime that reports a different release SHA', async (context) => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/release.json') {
      response.end(JSON.stringify({ schemaVersion: 1, commitSha: sha }));
    } else if (request.url === '/health') {
      response.end(JSON.stringify({ status: 'ok', releaseSha: '2'.repeat(40) }));
    } else {
      response.end(JSON.stringify({ application: 'roots' }));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      env: {
        ...process.env,
        RELEASE_SHA: sha,
        NETLIFY_PRODUCTION_URL: baseUrl,
        VERCEL_PRODUCTION_URL: baseUrl,
        NETLIFY_SITE_ID: 'site-id',
        NETLIFY_DEPLOY_ID: 'frontend-current',
        NETLIFY_DEPLOYED_SHA: sha,
        NETLIFY_ROLLBACK_DEPLOY_ID: 'frontend-previous',
        VERCEL_PROJECT_ID: 'project-id',
        VERCEL_DEPLOYMENT_ID: 'backend-current',
        VERCEL_DEPLOYED_SHA: sha,
        VERCEL_ROLLBACK_DEPLOYMENT_ID: 'backend-previous',
        CANARY_SAMPLES: '1',
      },
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stderr }));
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /backend release metadata/);
});
