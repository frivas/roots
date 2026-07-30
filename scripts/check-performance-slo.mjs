#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultSloFile = resolve(repositoryRoot, 'docs/deployment/performance-slo.json');

const metricContracts = {
  webVitals: {
    lcpP75Ms: 'lcpP75MsMax',
    inpP75Ms: 'inpP75MsMax',
    clsP75: 'clsP75Max',
  },
  backend: {
    p50Ms: 'p50MsMax',
    p95Ms: 'p95MsMax',
    p99Ms: 'p99MsMax',
    errorRate: 'errorRateMax',
    timeoutRate: 'timeoutRateMax',
  },
  provider: {
    p50Ms: 'p50MsMax',
    p95Ms: 'p95MsMax',
    p99Ms: 'p99MsMax',
    errorRate: 'errorRateMax',
    timeoutRate: 'timeoutRateMax',
  },
};

function fail(message) {
  throw new Error(message);
}

function finiteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) fail(`${label} must be a finite non-negative number`);
  return value;
}

function validMetric(value, label) {
  finiteNonNegative(value, label);
  if (/Rate(?:Max)?$/.test(label) && value > 1) fail(`${label} must be between 0 and 1`);
  return value;
}

export function readPerformanceSlo(sloFile = defaultSloFile) {
  const config = JSON.parse(readFileSync(sloFile, 'utf8'));
  if (config.schemaVersion !== 1) fail('performance SLO schemaVersion must be 1');

  for (const [domain, metrics] of Object.entries(metricContracts)) {
    for (const threshold of Object.values(metrics)) {
      validMetric(config[domain]?.[threshold], `${domain}.${threshold}`);
    }
  }
  return config;
}

export function enforcePerformanceSlo(observations, config) {
  if (observations.schemaVersion !== 1) fail('observations.schemaVersion must be 1');
  if (!/^[0-9a-f]{40}$/.test(observations.releaseSha ?? '')) {
    fail('observations.releaseSha must be a lowercase 40-character SHA');
  }
  if (process.env.RELEASE_SHA && observations.releaseSha !== process.env.RELEASE_SHA) {
    fail('observations.releaseSha must match RELEASE_SHA exactly');
  }
  if (!Number.isFinite(Date.parse(observations.collectedAt))) {
    fail('observations.collectedAt must be an ISO timestamp');
  }
  const failures = [];
  for (const [domain, metrics] of Object.entries(metricContracts)) {
    for (const [metric, threshold] of Object.entries(metrics)) {
      const observed = validMetric(observations[domain]?.[metric], `${domain}.${metric}`);
      const allowed = config[domain][threshold];
      if (observed > allowed) failures.push(`${domain}.${metric}=${observed} exceeds ${allowed}`);
    }
  }
  if (failures.length > 0) fail(`Performance SLO failed: ${failures.join('; ')}`);
}

function observationsArgument(argv) {
  const index = argv.indexOf('--observations');
  if (index === -1) return null;
  if (!argv[index + 1]) fail('--observations requires a JSON file');
  return resolve(argv[index + 1]);
}

export function runPerformanceSloCheck(argv = process.argv.slice(2)) {
  const config = readPerformanceSlo();
  if (argv.includes('--config-only')) return { configOnly: true };

  const observationsFile = observationsArgument(argv);
  if (!observationsFile) fail('Use --config-only or provide --observations <file>');
  const observations = JSON.parse(readFileSync(observationsFile, 'utf8'));
  enforcePerformanceSlo(observations, config);
  return { configOnly: false, observationsFile };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = runPerformanceSloCheck();
    console.log(result.configOnly
      ? 'Performance SLO contract is valid.'
      : `Performance SLO observations passed: ${result.observationsFile}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
