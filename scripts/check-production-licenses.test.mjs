import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('locked production dependencies satisfy the license policy', () => {
  const result = spawnSync(process.execPath, ['scripts/check-production-licenses.mjs'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Checked \d+ production dependency licenses/);
});
