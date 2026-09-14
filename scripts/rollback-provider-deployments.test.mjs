import assert from 'node:assert/strict';
import test from 'node:test';

import {
  rollbackVerifiedDeployments,
  verifyNetlifyRollback,
  verifyVercelRollback,
} from './rollback-provider-deployments.mjs';

const releaseSha = 'a'.repeat(40);
const rollbackSha = 'b'.repeat(40);

test('verifies immutable provider rollback targets', () => {
  assert.doesNotThrow(() => verifyNetlifyRollback({
    current: { id: 'netlify-current', site_id: 'site', state: 'ready', context: 'production', commit_ref: releaseSha },
    rollback: { id: 'netlify-previous', site_id: 'site', state: 'old', context: 'production', commit_ref: rollbackSha },
    siteId: 'site', currentId: 'netlify-current', rollbackId: 'netlify-previous', releaseSha,
  }));
  assert.doesNotThrow(() => verifyVercelRollback({
    rollback: { id: 'vercel-previous', project: { id: 'project' }, readyState: 'READY', target: 'production', readySubstate: 'PROMOTED', meta: { githubCommitRef: rollbackSha } },
    current: { id: 'vercel-current', project: { id: 'project' }, readyState: 'READY', target: 'production', gitSource: { sha: releaseSha } },
    projectId: 'project', currentId: 'vercel-current', rollbackId: 'vercel-previous', releaseSha,
  }));
});

test('rejects a mutable or unproven rollback target before dispatch', () => {
  assert.throws(() => verifyNetlifyRollback({
    current: { id: 'current', site_id: 'site', state: 'ready', context: 'production', commit_ref: releaseSha },
    rollback: { id: 'previous', site_id: 'other-site', state: 'old', context: 'production', commit_ref: rollbackSha },
    siteId: 'site', currentId: 'current', rollbackId: 'previous', releaseSha,
  }), /Netlify rollback target/);
  assert.throws(() => verifyVercelRollback({
    current: { id: 'current', project: { id: 'project' }, readyState: 'READY', target: 'production', meta: { githubCommitSha: releaseSha } },
    rollback: { id: 'previous', project: { id: 'project' }, readyState: 'READY', target: 'production', readySubstate: 'STAGED', meta: { githubCommitSha: rollbackSha } },
    projectId: 'project', currentId: 'current', rollbackId: 'previous', releaseSha,
  }), /previously promoted/);
});

test('dispatches neither rollback when either provider verification fails', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url: String(url), method: options.method ?? 'GET' });
    if (String(url).includes('api.netlify.com')) {
      const id = String(url).match(/deploys\/([^/]+)/)?.[1];
      return Response.json({ id, site_id: 'site', state: id === 'current' ? 'ready' : 'old', context: 'production', commit_ref: id === 'current' ? releaseSha : rollbackSha });
    }
    const id = String(url).match(/deployments\/([^?]+)/)?.[1];
    return Response.json({ id, project: { id: 'project' }, readyState: 'READY', target: 'production', readySubstate: id === 'current' ? 'PROMOTED' : 'STAGED', meta: { githubCommitSha: id === 'current' ? releaseSha : rollbackSha } });
  };

  await assert.rejects(() => rollbackVerifiedDeployments({
    releaseSha,
    netlifySiteId: 'site',
    netlifyToken: 'netlify-token',
    netlifyCurrentId: 'current',
    netlifyRollbackId: 'previous',
    vercelProjectId: 'project',
    vercelOrgId: 'team',
    vercelToken: 'vercel-token',
    vercelCurrentId: 'current',
    vercelRollbackId: 'previous',
  }, fetchImpl), /previously promoted/);
  assert.equal(requests.some(({ method }) => method === 'POST'), false);
});

test('dispatches both immutable rollback IDs after all verification passes', async () => {
  const posts = [];
  const fetchImpl = async (url, options = {}) => {
    const href = String(url);
    if (options.method === 'POST') {
      posts.push(href);
      return new Response('', { status: 201 });
    }
    if (href.includes('api.netlify.com')) {
      const id = href.match(/deploys\/([^/]+)/)?.[1];
      return Response.json({ id, site_id: 'site', state: id === 'current' ? 'ready' : 'old', context: 'production', commit_ref: id === 'current' ? releaseSha : rollbackSha });
    }
    const id = href.match(/deployments\/([^?]+)/)?.[1];
    return Response.json({ id, project: { id: 'project' }, readyState: 'READY', target: 'production', readySubstate: 'PROMOTED', meta: { githubCommitSha: id === 'current' ? releaseSha : rollbackSha } });
  };

  const result = await rollbackVerifiedDeployments({
    releaseSha,
    netlifySiteId: 'site',
    netlifyToken: 'netlify-token',
    netlifyCurrentId: 'current',
    netlifyRollbackId: 'previous',
    vercelProjectId: 'project',
    vercelOrgId: 'team',
    vercelToken: 'vercel-token',
    vercelCurrentId: 'current',
    vercelRollbackId: 'previous',
  }, fetchImpl);

  assert.equal(posts.length, 2);
  assert.match(posts[0], /netlify|vercel/);
  assert.deepEqual(result, {
    schemaVersion: 1,
    releaseSha,
    netlify: { rollbackDeployId: 'previous', status: 'dispatched' },
    vercel: { rollbackDeploymentId: 'previous', status: 'dispatched' },
  });
});
