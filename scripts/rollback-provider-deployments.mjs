import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { shaForVercel } from './provider-deployment-utils.mjs';

const required = (value, name) => {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required for automatic rollback`);
  return normalized;
};

const assertReleaseSha = (releaseSha) => {
  if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
    throw new Error('RELEASE_SHA must be a lowercase 40-character SHA');
  }
};

export const verifyNetlifyRollback = ({
  current,
  rollback,
  siteId,
  currentId,
  rollbackId,
  releaseSha,
}) => {
  if (
    currentId === rollbackId ||
    current?.id !== currentId ||
    current?.site_id !== siteId ||
    current?.context !== 'production' ||
    current?.state !== 'ready' ||
    current?.commit_ref !== releaseSha
  ) {
    throw new Error('Netlify current deployment identity could not be verified');
  }
  if (
    rollback?.id !== rollbackId ||
    rollback?.site_id !== siteId ||
    rollback?.context !== 'production' ||
    !['old', 'ready'].includes(rollback?.state) ||
    !/^[0-9a-f]{40}$/.test(rollback?.commit_ref ?? '') ||
    rollback?.commit_ref === releaseSha
  ) {
    throw new Error('Netlify rollback target is not an immutable previous production deploy');
  }
};

export const verifyVercelRollback = ({
  current,
  rollback,
  projectId,
  currentId,
  rollbackId,
  releaseSha,
}) => {
  if (
    currentId === rollbackId ||
    current?.id !== currentId ||
    current?.project?.id !== projectId ||
    current?.target !== 'production' ||
    current?.readyState !== 'READY' ||
    shaForVercel(current) !== releaseSha
  ) {
    throw new Error('Vercel current deployment identity could not be verified');
  }
  if (
    rollback?.id !== rollbackId ||
    rollback?.project?.id !== projectId ||
    rollback?.target !== 'production' ||
    rollback?.readyState !== 'READY' ||
    rollback?.readySubstate !== 'PROMOTED' ||
    !/^[0-9a-f]{40}$/.test(shaForVercel(rollback) ?? '') ||
    shaForVercel(rollback) === releaseSha
  ) {
    throw new Error('Vercel rollback target is not a previously promoted immutable deployment');
  }
};

const fetchJson = async (url, token, fetchImpl) => {
  const response = await fetchImpl(url, {
    headers: { authorization: `Bearer ${token}` },
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${url.origin} verification returned HTTP ${response.status}`);
  return response.json();
};

const dispatch = async (url, token, fetchImpl) => {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${url.origin} rollback returned HTTP ${response.status}`);
};

export const rollbackVerifiedDeployments = async (input, fetchImpl = fetch) => {
  const {
    releaseSha,
    netlifySiteId,
    netlifyToken,
    netlifyCurrentId,
    netlifyRollbackId,
    vercelProjectId,
    vercelOrgId,
    vercelToken,
    vercelCurrentId,
    vercelRollbackId,
  } = input;
  assertReleaseSha(releaseSha);

  const netlifyDeployUrl = (id) =>
    new URL(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(netlifySiteId)}/deploys/${encodeURIComponent(id)}`);
  const vercelDeployUrl = (id) => {
    const url = new URL(`https://api.vercel.com/v13/deployments/${encodeURIComponent(id)}`);
    url.searchParams.set('teamId', vercelOrgId);
    return url;
  };

  const [netlifyCurrent, netlifyRollback, vercelCurrent, vercelRollback] = await Promise.all([
    fetchJson(netlifyDeployUrl(netlifyCurrentId), netlifyToken, fetchImpl),
    fetchJson(netlifyDeployUrl(netlifyRollbackId), netlifyToken, fetchImpl),
    fetchJson(vercelDeployUrl(vercelCurrentId), vercelToken, fetchImpl),
    fetchJson(vercelDeployUrl(vercelRollbackId), vercelToken, fetchImpl),
  ]);

  verifyNetlifyRollback({
    current: netlifyCurrent,
    rollback: netlifyRollback,
    siteId: netlifySiteId,
    currentId: netlifyCurrentId,
    rollbackId: netlifyRollbackId,
    releaseSha,
  });
  verifyVercelRollback({
    current: vercelCurrent,
    rollback: vercelRollback,
    projectId: vercelProjectId,
    currentId: vercelCurrentId,
    rollbackId: vercelRollbackId,
    releaseSha,
  });

  const netlifyRestoreUrl = new URL(`${netlifyDeployUrl(netlifyRollbackId).href}/restore`);
  const vercelRollbackUrl = new URL(
    `https://api.vercel.com/v1/projects/${encodeURIComponent(vercelProjectId)}/rollback/${encodeURIComponent(vercelRollbackId)}`,
  );
  vercelRollbackUrl.searchParams.set('teamId', vercelOrgId);
  vercelRollbackUrl.searchParams.set('description', `Automated rollback after release gate failure for ${releaseSha}`);

  await Promise.all([
    dispatch(netlifyRestoreUrl, netlifyToken, fetchImpl),
    dispatch(vercelRollbackUrl, vercelToken, fetchImpl),
  ]);

  return {
    schemaVersion: 1,
    releaseSha,
    netlify: { rollbackDeployId: netlifyRollbackId, status: 'dispatched' },
    vercel: { rollbackDeploymentId: vercelRollbackId, status: 'dispatched' },
  };
};

const main = async () => {
  const input = {
    releaseSha: required(process.env.RELEASE_SHA, 'RELEASE_SHA'),
    netlifySiteId: required(process.env.NETLIFY_SITE_ID, 'NETLIFY_SITE_ID'),
    netlifyToken: required(process.env.NETLIFY_AUTH_TOKEN, 'NETLIFY_AUTH_TOKEN'),
    netlifyCurrentId: required(process.env.NETLIFY_DEPLOY_ID, 'NETLIFY_DEPLOY_ID'),
    netlifyRollbackId: required(process.env.NETLIFY_ROLLBACK_DEPLOY_ID, 'NETLIFY_ROLLBACK_DEPLOY_ID'),
    vercelProjectId: required(process.env.VERCEL_PROJECT_ID, 'VERCEL_PROJECT_ID'),
    vercelOrgId: required(process.env.VERCEL_ORG_ID, 'VERCEL_ORG_ID'),
    vercelToken: required(process.env.VERCEL_TOKEN, 'VERCEL_TOKEN'),
    vercelCurrentId: required(process.env.VERCEL_DEPLOYMENT_ID, 'VERCEL_DEPLOYMENT_ID'),
    vercelRollbackId: required(process.env.VERCEL_ROLLBACK_DEPLOYMENT_ID, 'VERCEL_ROLLBACK_DEPLOYMENT_ID'),
  };
  const evidence = await rollbackVerifiedDeployments(input);
  writeFileSync(
    process.env.ROLLBACK_EVIDENCE_FILE ?? 'rollback-evidence.json',
    `${JSON.stringify({ ...evidence, dispatchedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  console.log(`Dispatched verified provider rollbacks for failed release ${input.releaseSha}.`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
