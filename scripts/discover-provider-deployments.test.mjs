import assert from 'node:assert/strict';
import test from 'node:test';

import {
  selectNetlifyDeployments,
  selectVercelDeployments,
} from './discover-provider-deployments.mjs';

const sha = 'a'.repeat(40);

test('selects the exact ready Netlify deploy and an older rollback target', () => {
  const result = selectNetlifyDeployments([
    { id: 'failed', commit_ref: sha, state: 'error', context: 'production' },
    { id: 'current', commit_ref: sha, state: 'ready', context: 'production' },
    { id: 'previous', commit_ref: 'b'.repeat(40), state: 'ready', context: 'production' },
  ], sha);

  assert.deepEqual(result, {
    currentId: 'current',
    currentSha: sha,
    rollbackId: 'previous',
  });
});

test('selects the exact ready Vercel production deploy and an older rollback target', () => {
  const result = selectVercelDeployments([
    { uid: 'preview', state: 'READY', target: null, meta: { githubCommitSha: sha } },
    { uid: 'current', state: 'READY', target: 'production', gitSource: { sha } },
    { uid: 'previous', state: 'READY', target: 'production', meta: { githubCommitRef: 'c'.repeat(40) } },
  ], sha);

  assert.deepEqual(result, {
    currentId: 'current',
    currentSha: sha,
    rollbackId: 'previous',
  });
});

test('fails closed until both current and rollback deployments exist', () => {
  assert.throws(
    () => selectNetlifyDeployments([
      { id: 'current', commit_ref: sha, state: 'ready', context: 'production' },
    ], sha),
    /rollback target/,
  );
  assert.throws(
    () => selectVercelDeployments([
      { uid: 'previous', state: 'READY', target: 'production', meta: { githubCommitSha: 'd'.repeat(40) } },
    ], sha),
    /exact release/,
  );
});
