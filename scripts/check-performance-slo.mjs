#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultSloFile = resolve(repositoryRoot, 'docs/deployment/performance-slo.json');
const defaultProviderFile = resolve(repositoryRoot, 'docs/deployment/provider-contract.json');

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

export function readPerformanceEvidenceContract(providerFile = defaultProviderFile) {
  const provider = JSON.parse(readFileSync(providerFile, 'utf8'));
  const contract = provider.performanceEvidence;
  if (
    !contract ||
    typeof contract.collectorUrlVariable !== 'string' ||
    typeof contract.collectorIdVariable !== 'string' ||
    typeof contract.collectorTokenVariable !== 'string' ||
    typeof contract.workflowAudience !== 'string'
  ) {
    fail('provider contract must define the performance evidence collector identity');
  }
  for (const name of [
    'minimumWindowSeconds',
    'maximumAgeSeconds',
    'maximumCollectionLagSeconds',
  ]) {
    if (!Number.isInteger(contract[name]) || contract[name] < 1) {
      fail(`performanceEvidence.${name} must be a positive integer`);
    }
  }
  return contract;
}

const timestamp = (value, label) => {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) fail(`${label} must be an ISO timestamp`);
  return milliseconds;
};

export function validatePerformanceEvidence(
  observations,
  contract,
  {
    expectedCollectorId = process.env.PERFORMANCE_COLLECTOR_ID,
    expectedCollectorUrl = process.env[contract.collectorUrlVariable],
    expectedReleaseSha = process.env.RELEASE_SHA,
    nowMs = Date.now(),
  } = {},
) {
  if (observations.schemaVersion !== 1) fail('observations.schemaVersion must be 1');
  if (!/^[0-9a-f]{40}$/.test(observations.releaseSha ?? '')) {
    fail('observations.releaseSha must be a lowercase 40-character SHA');
  }
  if (expectedReleaseSha && observations.releaseSha !== expectedReleaseSha) {
    fail('observations.releaseSha must match RELEASE_SHA exactly');
  }
  if (!expectedCollectorId) {
    fail('PERFORMANCE_COLLECTOR_ID is required to validate observations');
  }
  if (!expectedCollectorUrl) {
    fail(`${contract.collectorUrlVariable} is required to validate observations`);
  }
  let expectedCollectorOrigin;
  try {
    expectedCollectorOrigin = new URL(expectedCollectorUrl).origin;
  } catch {
    fail(`${contract.collectorUrlVariable} must be a valid URL`);
  }
  if (observations.collector?.id !== expectedCollectorId) {
    fail('observations collector identity does not match PERFORMANCE_COLLECTOR_ID');
  }
  if (observations.collector?.audience !== contract.workflowAudience) {
    fail('observations collector audience does not match the deployed canary');
  }

  const startedAt = timestamp(observations.window?.startedAt, 'observations.window.startedAt');
  const endedAt = timestamp(observations.window?.endedAt, 'observations.window.endedAt');
  const collectedAt = timestamp(observations.collectedAt, 'observations.collectedAt');
  const retrievedAt = timestamp(
    observations.retrieval?.retrievedAt,
    'observations.retrieval.retrievedAt',
  );
  if (endedAt <= startedAt) fail('observations measurement window must end after it starts');
  if (endedAt - startedAt < contract.minimumWindowSeconds * 1_000) {
    fail('observations measurement window is shorter than the required minimum');
  }
  if (endedAt > nowMs + 60_000 || collectedAt > nowMs + 60_000 || retrievedAt > nowMs + 60_000) {
    fail('observations timestamps cannot be in the future');
  }
  if (nowMs - endedAt > contract.maximumAgeSeconds * 1_000) {
    fail('observations measurement window is stale');
  }
  if (
    collectedAt < endedAt ||
    collectedAt - endedAt > contract.maximumCollectionLagSeconds * 1_000
  ) {
    fail('observations collection time is outside the allowed window lag');
  }
  if (retrievedAt < collectedAt) {
    fail('observations retrieval must occur after collector emission');
  }
  if (
    observations.retrieval?.repository !==
      contract.workflowAudience.split('/.github/workflows/')[0] ||
    observations.retrieval?.collectorOrigin !== expectedCollectorOrigin ||
    !/^[1-9][0-9]*$/.test(observations.retrieval?.runId ?? '') ||
    !observations.retrieval?.workflowRef?.startsWith(`${contract.workflowAudience}@`)
  ) {
    fail('observations retrieval identity does not match the deployed canary workflow');
  }
}

export function enforcePerformanceSlo(
  observations,
  config,
  evidenceContract = readPerformanceEvidenceContract(),
  options,
) {
  validatePerformanceEvidence(observations, evidenceContract, options);
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
  const evidenceContract = readPerformanceEvidenceContract();
  if (argv.includes('--config-only')) return { configOnly: true };

  const observationsFile = observationsArgument(argv);
  if (!observationsFile) fail('Use --config-only or provide --observations <file>');
  const observations = JSON.parse(readFileSync(observationsFile, 'utf8'));
  enforcePerformanceSlo(observations, config, evidenceContract);
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
