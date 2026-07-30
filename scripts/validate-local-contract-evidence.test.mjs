import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const script = new URL('validate-local-contract-evidence.mjs', import.meta.url).pathname;

const run = (status) => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-local-contract-'));
  const reportFile = join(directory, 'report.json');
  writeFileSync(reportFile, JSON.stringify({
    numFailedTests: 0,
    numPendingTests: status === 'pending' ? 1 : 0,
    numPassedTests: status === 'passed' ? 1 : 0,
    testResults: [{
      assertionResults: [{
        ancestorTitles: ['Clerk/Supabase local contract'],
        title: 'passes a Clerk-shaped string subject through the request client into RLS',
        status,
      }],
    }],
  }));
  return spawnSync(process.execPath, [script, reportFile], { encoding: 'utf8' });
};

test('accepts evidence that the enabled local contract passed', () => {
  assert.equal(run('passed').status, 0);
});

test('fails closed when the enabled local contract skipped', () => {
  const result = run('pending');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not pass|skipped/);
});
