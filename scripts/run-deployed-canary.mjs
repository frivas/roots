import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const samples = Number.parseInt(process.env.CANARY_SAMPLES || '5', 10);
const timeoutMs = Number.parseInt(process.env.CANARY_TIMEOUT_MS || '10000', 10);
if (!Number.isInteger(samples) || samples < 1 || !Number.isInteger(timeoutMs) || timeoutMs < 1) {
  throw new Error('CANARY_SAMPLES and CANARY_TIMEOUT_MS must be positive integers');
}

const releaseSha = process.env.RELEASE_SHA;
const frontendUrl = new URL(process.env.NETLIFY_PRODUCTION_URL);
const backendUrl = new URL(process.env.VERCEL_PRODUCTION_URL);

const request = async (url) => {
  const started = performance.now();
  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const elapsedMs = Math.round((performance.now() - started) * 100) / 100;
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return { response, elapsedMs };
};

const releaseResponse = await request(new URL('/release.json', frontendUrl));
const release = await releaseResponse.response.json();
if (release.schemaVersion !== 1 || release.commitSha !== releaseSha) {
  throw new Error('deployed frontend release metadata does not match RELEASE_SHA');
}

const observations = { frontend: [], backend: [] };
for (let index = 0; index < samples; index += 1) {
  observations.frontend.push((await request(frontendUrl)).elapsedMs);
  observations.backend.push((await request(new URL('/health', backendUrl))).elapsedMs);
}

const percentile = (values, quantile) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(quantile * sorted.length) - 1];
};
const summarize = (values) => ({
  samples: values.length,
  p50Ms: percentile(values, 0.5),
  p95Ms: percentile(values, 0.95),
  p99Ms: percentile(values, 0.99),
});

const evidence = {
  schemaVersion: 1,
  releaseSha,
  source: {
    repository: process.env.GITHUB_REPOSITORY,
    runId: process.env.GITHUB_RUN_ID,
    workflowRef: process.env.GITHUB_WORKFLOW_REF,
  },
  frontend: {
    provider: 'netlify',
    siteId: process.env.NETLIFY_SITE_ID,
    deployId: process.env.NETLIFY_DEPLOY_ID,
    deployedSha: process.env.NETLIFY_DEPLOYED_SHA,
    rollbackDeployId: process.env.NETLIFY_ROLLBACK_DEPLOY_ID,
    url: frontendUrl.href,
    latency: summarize(observations.frontend),
  },
  backend: {
    provider: 'vercel',
    projectId: process.env.VERCEL_PROJECT_ID,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    deployedSha: process.env.VERCEL_DEPLOYED_SHA,
    rollbackDeploymentId: process.env.VERCEL_ROLLBACK_DEPLOYMENT_ID,
    url: backendUrl.href,
    latency: summarize(observations.backend),
  },
};

writeFileSync(
  resolve(process.env.RELEASE_EVIDENCE_FILE || 'release-evidence.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
);
console.log(`Verified exact deployed SHA ${releaseSha} across ${samples} canary samples.`);
