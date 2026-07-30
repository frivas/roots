import assert from 'node:assert/strict';
import test from 'node:test';

import {
  enforcePerformanceSlo,
  readPerformanceEvidenceContract,
  readPerformanceSlo,
} from './check-performance-slo.mjs';

const now = Date.parse('2026-07-30T00:10:00.000Z');
const passingObservations = {
  schemaVersion: 1,
  releaseSha: 'a'.repeat(40),
  collector: {
    id: 'roots-production-observability',
    audience: 'frivas/roots/.github/workflows/deployed-canary.yml',
  },
  window: {
    startedAt: '2026-07-30T00:00:00.000Z',
    endedAt: '2026-07-30T00:08:00.000Z',
  },
  collectedAt: '2026-07-30T00:09:00.000Z',
  retrieval: {
    retrievedAt: '2026-07-30T00:09:30.000Z',
    collectorOrigin: 'https://observability.example.com',
    repository: 'frivas/roots',
    runId: '12345',
    workflowRef: 'frivas/roots/.github/workflows/deployed-canary.yml@refs/heads/main',
  },
  webVitals: { lcpP75Ms: 2000, inpP75Ms: 150, clsP75: 0.05 },
  backend: { p50Ms: 100, p95Ms: 500, p99Ms: 1000, errorRate: 0, timeoutRate: 0 },
  provider: { p50Ms: 5000, p95Ms: 20000, p99Ms: 25000, errorRate: 0.01, timeoutRate: 0 },
};
const evidenceContract = readPerformanceEvidenceContract();
const options = {
  expectedCollectorId: passingObservations.collector.id,
  expectedCollectorUrl: 'https://observability.example.com/roots',
  expectedReleaseSha: passingObservations.releaseSha,
  nowMs: now,
};
const enforce = (observations) =>
  enforcePerformanceSlo(observations, readPerformanceSlo(), evidenceContract, options);

test('accepts observations inside every checked-in SLO', () => {
  assert.doesNotThrow(() => enforce(passingObservations));
});

test('fails closed when an observed percentile exceeds its SLO', () => {
  const observations = structuredClone(passingObservations);
  observations.backend.p99Ms = 2000;
  assert.throws(
    () => enforce(observations),
    /backend\.p99Ms=2000 exceeds 1500/,
  );
});

test('fails closed when required observations are absent', () => {
  const observations = structuredClone(passingObservations);
  delete observations.provider.timeoutRate;
  assert.throws(
    () => enforce(observations),
    /provider\.timeoutRate must be a finite non-negative number/,
  );
});

test('fails closed when a rate is outside the unit interval', () => {
  const observations = structuredClone(passingObservations);
  observations.provider.errorRate = 1.01;
  assert.throws(
    () => enforce(observations),
    /provider\.errorRate must be between 0 and 1/,
  );
});

test('fails closed when collector identity does not match', () => {
  const observations = structuredClone(passingObservations);
  observations.collector.id = 'untrusted';
  assert.throws(() => enforce(observations), /collector identity/);
});

test('fails closed when the measurement window is stale', () => {
  const observations = structuredClone(passingObservations);
  observations.window.startedAt = '2026-07-29T23:00:00.000Z';
  observations.window.endedAt = '2026-07-29T23:10:00.000Z';
  observations.collectedAt = '2026-07-29T23:11:00.000Z';
  observations.retrieval.retrievedAt = '2026-07-29T23:11:30.000Z';
  assert.throws(() => enforce(observations), /stale/);
});
