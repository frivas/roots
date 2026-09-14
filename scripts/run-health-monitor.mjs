import { writeFileSync } from 'node:fs';

const timeoutMs = Number.parseInt(process.env.HEALTH_TIMEOUT_MS ?? '10000', 10);
if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error('HEALTH_TIMEOUT_MS must be a positive integer');

const request = async (url, parseJson = false) => {
  const started = performance.now();
  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'roots-production-health-monitor/1' },
  });
  const durationMs = Math.round((performance.now() - started) * 100) / 100;
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const body = parseJson ? await response.json() : undefined;
  if (!parseJson) await response.arrayBuffer();
  return {
    durationMs,
    requestId: response.headers.get('x-request-id'),
    body,
  };
};

const requiredUrl = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return new URL(value);
};
const frontendUrl = requiredUrl('FRONTEND_HEALTH_URL');
const backendUrl = requiredUrl('BACKEND_HEALTH_URL');
const expectedSha = process.env.EXPECTED_RELEASE_SHA;
if (expectedSha && !/^[0-9a-f]{40}$/.test(expectedSha)) {
  throw new Error('EXPECTED_RELEASE_SHA must be a lowercase 40-character SHA');
}

const [frontend, frontendRelease, backend] = await Promise.all([
  request(frontendUrl),
  request(new URL('/release.json', frontendUrl), true),
  request(new URL('/health', backendUrl), true),
]);
const releaseSha = frontendRelease.body?.commitSha;
if (
  frontendRelease.body?.schemaVersion !== 1 ||
  !/^[0-9a-f]{40}$/.test(releaseSha ?? '') ||
  backend.body?.status !== 'ok' ||
  backend.body?.releaseSha !== releaseSha ||
  (expectedSha && releaseSha !== expectedSha)
) {
  throw new Error('production release identity mismatch');
}

const evidence = {
  schemaVersion: 1,
  status: 'healthy',
  observedAt: new Date().toISOString(),
  releaseSha,
  source: {
    repository: process.env.GITHUB_REPOSITORY ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
  },
  frontend: { durationMs: frontend.durationMs, releaseMetadataDurationMs: frontendRelease.durationMs },
  backend: {
    durationMs: backend.durationMs,
    requestId: backend.requestId,
    mode: backend.body.mode,
  },
};
writeFileSync(process.env.HEALTH_EVIDENCE_FILE ?? 'health-evidence.json', `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ event: 'production_health_probe', status: 'healthy', releaseSha }));
