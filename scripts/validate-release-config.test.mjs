import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const sha = 'a'.repeat(40);
const validEnv = {
  ...process.env,
  RELEASE_SHA: sha,
  NETLIFY_SITE_ID: 'site-123',
  NETLIFY_DEPLOY_ID: 'netlify-current',
  NETLIFY_DEPLOYED_SHA: sha,
  NETLIFY_PRODUCTION_URL: 'https://roots.example.com',
  NETLIFY_ROLLBACK_DEPLOY_ID: 'netlify-previous',
  VERCEL_PROJECT_ID: 'prj_GSAg55JO0lYdjI7tCQqwC6u7qp4C',
  VERCEL_DEPLOYMENT_ID: 'vercel-current',
  VERCEL_DEPLOYED_SHA: sha,
  VERCEL_PRODUCTION_URL: 'https://api.roots.example.com',
  VERCEL_ROLLBACK_DEPLOYMENT_ID: 'vercel-previous',
};

const run = (env = validEnv, args = ['--release']) =>
  spawnSync(process.execPath, ['scripts/validate-release-config.mjs', ...args], {
    cwd: new URL('../', import.meta.url),
    env,
    encoding: 'utf8',
  });

test('checked release contracts are valid without provider input', () => {
  assert.equal(run(process.env, []).status, 0);
});

test('complete exact-SHA release identity is valid', () => {
  assert.equal(run().status, 0);
});

test('deployed SHA mismatch fails closed', () => {
  const result = run({ ...validEnv, NETLIFY_DEPLOYED_SHA: 'b'.repeat(40) });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must match RELEASE_SHA/);
});

test('current deployment cannot be its own rollback target', () => {
  const result = run({
    ...validEnv,
    VERCEL_ROLLBACK_DEPLOYMENT_ID: validEnv.VERCEL_DEPLOYMENT_ID,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must differ/);
});
