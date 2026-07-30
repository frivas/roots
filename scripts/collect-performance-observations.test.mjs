import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('collect-performance-observations.mjs', import.meta.url).pathname;
const sha = 'e'.repeat(40);
const collectorId = 'roots-production-observability';

const observations = (overrides = {}) => {
  const now = Date.now();
  return {
    schemaVersion: 1,
    releaseSha: sha,
    collector: {
      id: collectorId,
      audience: 'frivas/roots/.github/workflows/deployed-canary.yml',
    },
    window: {
      startedAt: new Date(now - 10 * 60_000).toISOString(),
      endedAt: new Date(now - 2 * 60_000).toISOString(),
    },
    collectedAt: new Date(now - 60_000).toISOString(),
    webVitals: { lcpP75Ms: 2000, inpP75Ms: 150, clsP75: 0.05 },
    backend: { p50Ms: 100, p95Ms: 500, p99Ms: 1000, errorRate: 0, timeoutRate: 0 },
    provider: { p50Ms: 5000, p95Ms: 20000, p99Ms: 25000, errorRate: 0.01, timeoutRate: 0 },
    ...overrides,
  };
};

const run = async (payload) => {
  const server = createServer((request, response) => {
    assert.equal(request.headers.authorization, 'Bearer collector-secret');
    assert.equal(request.headers['x-roots-release-sha'], sha);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(payload));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const directory = mkdtempSync(join(tmpdir(), 'roots-performance-collector-'));
  const output = join(directory, 'observations.json');
  const address = server.address();
  const env = {
    ...process.env,
    RELEASE_SHA: sha,
    PERFORMANCE_COLLECTOR_URL: `http://127.0.0.1:${address.port}/observations`,
    PERFORMANCE_COLLECTOR_ID: collectorId,
    PERFORMANCE_COLLECTOR_TOKEN: 'collector-secret',
    PERFORMANCE_OBSERVATIONS_FILE: output,
    GITHUB_REPOSITORY: 'frivas/roots',
    GITHUB_RUN_ID: '12345',
    GITHUB_WORKFLOW_REF:
      'frivas/roots/.github/workflows/deployed-canary.yml@refs/heads/main',
    ALLOW_INSECURE_PERFORMANCE_COLLECTOR_FOR_TESTS: '1',
  };
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { env });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stderr }));
  });
  await new Promise((resolve) => server.close(resolve));
  return { ...result, output };
};

test('fetches and records workflow-bound collector evidence', async () => {
  const result = await run(observations());
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(readFileSync(result.output, 'utf8'));
  assert.equal(evidence.collector.id, collectorId);
  assert.equal(evidence.retrieval.runId, '12345');
  assert.equal(evidence.retrieval.collectorOrigin.startsWith('http://127.0.0.1:'), true);
  assert.equal(JSON.stringify(evidence).includes('collector-secret'), false);
});

test('fails closed for stale collector evidence', async () => {
  const stale = Date.now() - 60 * 60_000;
  const result = await run(observations({
    window: {
      startedAt: new Date(stale - 10 * 60_000).toISOString(),
      endedAt: new Date(stale).toISOString(),
    },
    collectedAt: new Date(stale + 60_000).toISOString(),
  }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stale/);
});

test('fails closed for the wrong collector identity', async () => {
  const result = await run(observations({
    collector: {
      id: 'untrusted-collector',
      audience: 'frivas/roots/.github/workflows/deployed-canary.yml',
    },
  }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /collector identity/);
});

test('fails closed for observations from a different release SHA', async () => {
  const result = await run(observations({ releaseSha: 'f'.repeat(40) }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /match RELEASE_SHA/);
});
