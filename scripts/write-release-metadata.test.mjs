import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('writes exact immutable release metadata', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'roots-release-'));
  const sha = 'c'.repeat(40);
  const result = spawnSync(process.execPath, [
    new URL('write-release-metadata.mjs', import.meta.url).pathname,
  ], {
    cwd,
    env: { ...process.env, COMMIT_REF: sha },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    JSON.parse(readFileSync(join(cwd, 'dist/release.json'), 'utf8')),
    { schemaVersion: 1, commitSha: sha },
  );
});

test('rejects missing or non-SHA release identity', () => {
  const env = { ...process.env };
  delete env.COMMIT_REF;
  delete env.GITHUB_SHA;
  const result = spawnSync(process.execPath, [
    new URL('write-release-metadata.mjs', import.meta.url).pathname,
  ], { env, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /40-character SHA/);
});
