import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('check-npm-audit.mjs', import.meta.url).pathname;
const runFixture = (audit) => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-audit-'));
  const path = join(directory, 'audit.json');
  writeFileSync(path, JSON.stringify(audit));
  return spawnSync(process.execPath, [
    script,
    '--workspace',
    'frontend',
    '--audit-file',
    path,
  ], { encoding: 'utf8' });
};
const rscAudit = {
  auditReportVersion: 2,
  metadata: {
    vulnerabilities: { high: 2, critical: 0, total: 2 },
  },
  vulnerabilities: {
    'react-router': {
      name: 'react-router',
      severity: 'high',
      via: [{ url: 'https://github.com/advisories/GHSA-qwww-vcr4-c8h2' }],
    },
    'react-router-dom': {
      name: 'react-router-dom',
      severity: 'high',
      via: ['react-router'],
    },
  },
};

test('rejects high findings even when a vulnerable feature is not enabled', () => {
  const result = runFixture(rscAudit);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /high or critical findings/);
});

test('rejects an npm error response instead of treating it as clean', () => {
  const result = runFixture({ error: { code: 'EAI_AGAIN' } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing its report schema/);
});

test('rejects any additional high or critical advisory', () => {
  const result = runFixture({
    ...rscAudit,
    metadata: {
      vulnerabilities: { high: 2, critical: 1, total: 3 },
    },
    vulnerabilities: {
      ...rscAudit.vulnerabilities,
      vulnerable: { name: 'vulnerable', severity: 'critical', via: [] },
    },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /high or critical findings/);
});
