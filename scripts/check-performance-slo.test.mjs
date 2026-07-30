import assert from 'node:assert/strict';
import test from 'node:test';

import {
  enforcePerformanceSlo,
  readPerformanceSlo,
} from './check-performance-slo.mjs';

const passingObservations = {
  schemaVersion: 1,
  releaseSha: 'a'.repeat(40),
  collectedAt: '2026-07-30T00:00:00.000Z',
  webVitals: { lcpP75Ms: 2000, inpP75Ms: 150, clsP75: 0.05 },
  backend: { p50Ms: 100, p95Ms: 500, p99Ms: 1000, errorRate: 0, timeoutRate: 0 },
  provider: { p50Ms: 5000, p95Ms: 20000, p99Ms: 25000, errorRate: 0.01, timeoutRate: 0 },
};

test('accepts observations inside every checked-in SLO', () => {
  assert.doesNotThrow(() => enforcePerformanceSlo(passingObservations, readPerformanceSlo()));
});

test('fails closed when an observed percentile exceeds its SLO', () => {
  const observations = structuredClone(passingObservations);
  observations.backend.p99Ms = 2000;
  assert.throws(
    () => enforcePerformanceSlo(observations, readPerformanceSlo()),
    /backend\.p99Ms=2000 exceeds 1500/,
  );
});

test('fails closed when required observations are absent', () => {
  const observations = structuredClone(passingObservations);
  delete observations.provider.timeoutRate;
  assert.throws(
    () => enforcePerformanceSlo(observations, readPerformanceSlo()),
    /provider\.timeoutRate must be a finite non-negative number/,
  );
});

test('fails closed when a rate is outside the unit interval', () => {
  const observations = structuredClone(passingObservations);
  observations.provider.errorRate = 1.01;
  assert.throws(
    () => enforcePerformanceSlo(observations, readPerformanceSlo()),
    /provider\.errorRate must be between 0 and 1/,
  );
});
