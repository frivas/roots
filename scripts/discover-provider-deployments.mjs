import { appendFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { shaForVercel } from './provider-deployment-utils.mjs';

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`missing required value: ${name}`);
  return value;
};

export const selectNetlifyDeployments = (deployments, releaseSha) => {
  const eligible = deployments.filter(
    (deploy) => deploy?.state === 'ready' && deploy?.context === 'production',
  );
  const current = eligible.find((deploy) => deploy.commit_ref === releaseSha);
  if (!current) throw new Error('Netlify exact release deployment is not ready');
  const rollback = eligible.find(
    (deploy) => deploy.id !== current.id && deploy.commit_ref !== releaseSha,
  );
  if (!rollback) throw new Error('Netlify rollback target is not available');
  return { currentId: current.id, currentSha: current.commit_ref, rollbackId: rollback.id };
};

export const selectVercelDeployments = (deployments, releaseSha) => {
  const eligible = deployments.filter(
    (deploy) => deploy?.state === 'READY' && deploy?.target === 'production',
  );
  const current = eligible.find((deploy) => shaForVercel(deploy) === releaseSha);
  if (!current) throw new Error('Vercel exact release deployment is not ready');
  const rollback = eligible.find(
    (deploy) => deploy.uid !== current.uid && shaForVercel(deploy) !== releaseSha,
  );
  if (!rollback) throw new Error('Vercel rollback target is not available');
  return { currentId: current.uid, currentSha: shaForVercel(current), rollbackId: rollback.uid };
};

const fetchJson = async (url, token) => {
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${url.origin} deployment API returned HTTP ${response.status}`);
  return response.json();
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const discover = async () => {
  const releaseSha = required('RELEASE_SHA');
  if (!/^[0-9a-f]{40}$/.test(releaseSha)) throw new Error('RELEASE_SHA must be a lowercase 40-character SHA');
  const netlifySiteId = required('NETLIFY_SITE_ID');
  const netlifyToken = required('NETLIFY_AUTH_TOKEN');
  const vercelProjectId = required('VERCEL_PROJECT_ID');
  const vercelOrgId = required('VERCEL_ORG_ID');
  const vercelToken = required('VERCEL_TOKEN');
  const attempts = Number.parseInt(process.env.DEPLOYMENT_DISCOVERY_ATTEMPTS ?? '30', 10);
  const intervalMs = Number.parseInt(process.env.DEPLOYMENT_DISCOVERY_INTERVAL_MS ?? '20000', 10);
  if (!Number.isInteger(attempts) || attempts < 1 || !Number.isInteger(intervalMs) || intervalMs < 0) {
    throw new Error('deployment discovery bounds must be non-negative integers');
  }

  const netlifyUrl = new URL(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(netlifySiteId)}/deploys`);
  netlifyUrl.searchParams.set('per_page', '50');
  const vercelUrl = new URL('https://api.vercel.com/v6/deployments');
  vercelUrl.searchParams.set('projectId', vercelProjectId);
  vercelUrl.searchParams.set('teamId', vercelOrgId);
  vercelUrl.searchParams.set('target', 'production');
  vercelUrl.searchParams.set('limit', '50');

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const [netlify, vercel] = await Promise.all([
        fetchJson(netlifyUrl, netlifyToken),
        fetchJson(vercelUrl, vercelToken),
      ]);
      return {
        schemaVersion: 1,
        releaseSha,
        discoveredAt: new Date().toISOString(),
        netlify: selectNetlifyDeployments(netlify, releaseSha),
        vercel: selectVercelDeployments(vercel.deployments ?? [], releaseSha),
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(intervalMs);
    }
  }
  throw lastError;
};

const main = async () => {
  const result = await discover();
  const evidenceFile = process.env.DEPLOYMENT_DISCOVERY_FILE ?? 'deployment-discovery.json';
  writeFileSync(evidenceFile, `${JSON.stringify(result, null, 2)}\n`);
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    appendFileSync(envFile, [
      `NETLIFY_DEPLOY_ID=${result.netlify.currentId}`,
      `NETLIFY_DEPLOYED_SHA=${result.netlify.currentSha}`,
      `NETLIFY_ROLLBACK_DEPLOY_ID=${result.netlify.rollbackId}`,
      `VERCEL_DEPLOYMENT_ID=${result.vercel.currentId}`,
      `VERCEL_DEPLOYED_SHA=${result.vercel.currentSha}`,
      `VERCEL_ROLLBACK_DEPLOYMENT_ID=${result.vercel.rollbackId}`,
      '',
    ].join('\n'));
  }
  console.log(`Discovered exact-SHA deployments and immutable rollback targets for ${result.releaseSha}.`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
