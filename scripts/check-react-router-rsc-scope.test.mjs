import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Roots does not enable React Router RSC mode', () => {
  const result = spawnSync(process.execPath, ['scripts/check-react-router-rsc-scope.mjs'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /does not enable React Router RSC mode/);
});
