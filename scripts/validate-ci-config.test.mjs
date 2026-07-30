import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('CI, runtime, deployment, and canonical tooling contracts are valid', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-ci-config.mjs'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated \d+ workflow files/);
});
