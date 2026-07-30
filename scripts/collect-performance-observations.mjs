import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  readPerformanceEvidenceContract,
  validatePerformanceEvidence,
} from './check-performance-slo.mjs';

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const evidenceContract = readPerformanceEvidenceContract();
const collectorUrl = new URL(required(evidenceContract.collectorUrlVariable));
if (
  collectorUrl.protocol !== 'https:' &&
  !(process.env.ALLOW_INSECURE_PERFORMANCE_COLLECTOR_FOR_TESTS === '1' &&
    ['127.0.0.1', 'localhost'].includes(collectorUrl.hostname))
) {
  throw new Error(`${evidenceContract.collectorUrlVariable} must use HTTPS`);
}

const collectorId = required(evidenceContract.collectorIdVariable);
const collectorToken = required(evidenceContract.collectorTokenVariable);
const releaseSha = required('RELEASE_SHA');
const repository = required('GITHUB_REPOSITORY');
const runId = required('GITHUB_RUN_ID');
const workflowRef = required('GITHUB_WORKFLOW_REF');
if (`${repository}/.github/workflows/deployed-canary.yml` !== evidenceContract.workflowAudience) {
  throw new Error('GitHub repository does not match the performance collector audience');
}
if (!workflowRef.startsWith(`${evidenceContract.workflowAudience}@`)) {
  throw new Error('GITHUB_WORKFLOW_REF does not identify the deployed canary workflow');
}
if (!/^[1-9][0-9]*$/.test(runId)) {
  throw new Error('GITHUB_RUN_ID must be a positive integer');
}

collectorUrl.searchParams.set('release_sha', releaseSha);
const response = await fetch(collectorUrl, {
  headers: {
    accept: 'application/json',
    authorization: `Bearer ${collectorToken}`,
    'cache-control': 'no-store',
    'x-roots-release-sha': releaseSha,
    'x-github-run-id': runId,
  },
  redirect: 'error',
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) {
  throw new Error(`performance collector returned HTTP ${response.status}`);
}

let observations;
try {
  observations = await response.json();
} catch {
  throw new Error('performance collector response must be valid JSON');
}

const retrievedAt = new Date().toISOString();
const evidence = {
  ...observations,
  retrieval: {
    retrievedAt,
    collectorOrigin: collectorUrl.origin,
    repository,
    runId,
    workflowRef,
  },
};
validatePerformanceEvidence(evidence, evidenceContract, {
  expectedCollectorId: collectorId,
  expectedCollectorUrl: collectorUrl.href,
  expectedReleaseSha: releaseSha,
  nowMs: Date.parse(retrievedAt),
});

const evidenceFile = resolve(
  process.env.PERFORMANCE_OBSERVATIONS_FILE || 'performance-observations.json',
);
mkdirSync(dirname(evidenceFile), { recursive: true });
writeFileSync(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Collected fresh exact-SHA observations from collector ${collectorId}.`);
