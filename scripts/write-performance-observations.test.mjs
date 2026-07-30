import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('write-performance-observations.mjs', import.meta.url).pathname;
const sha = 'e'.repeat(40);

test('writes observations only for the exact release SHA', () => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-performance-'));
  const output = join(directory, 'observations.json');
  const observations = { schemaVersion: 1, releaseSha: sha };
  const result = spawnSync(process.execPath, [script], {
    env: {
      ...process.env,
      RELEASE_SHA: sha,
      PERFORMANCE_OBSERVATIONS_JSON: JSON.stringify(observations),
      PERFORMANCE_OBSERVATIONS_FILE: output,
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')), observations);
});

test('rejects observations from a different release', () => {
  const result = spawnSync(process.execPath, [script], {
    env: {
      ...process.env,
      RELEASE_SHA: sha,
      PERFORMANCE_OBSERVATIONS_JSON: JSON.stringify({
        schemaVersion: 1,
        releaseSha: 'f'.repeat(40),
      }),
    },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /exact RELEASE_SHA/);
});
