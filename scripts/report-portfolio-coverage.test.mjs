import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('report-portfolio-coverage.sh', import.meta.url).pathname;
const sha = 'd'.repeat(40);

const fixture = () => {
  const cwd = mkdtempSync(join(tmpdir(), 'roots-coverage-'));
  for (const workspace of ['frontend', 'backend']) {
    mkdirSync(join(cwd, workspace, 'coverage'), { recursive: true });
    writeFileSync(
      join(cwd, workspace, 'coverage/coverage-summary.json'),
      JSON.stringify({ total: { lines: { covered: 90, total: 100, pct: 90 } } }),
    );
    writeFileSync(
      join(cwd, workspace, 'coverage/test-results.json'),
      JSON.stringify({ numTotalTests: workspace === 'frontend' ? 10 : 5, numPassedTests: workspace === 'frontend' ? 10 : 5 }),
    );
  }
  return cwd;
};

const env = (cwd) => ({
  ...process.env,
  COVERAGE_DRY_RUN: '1',
  COVERAGE_EVIDENCE_FILE: join(cwd, 'coverage-evidence.json'),
  REPO: 'frivas/roots',
  SOURCE_COMMIT_SHA: sha,
  COVERAGE_RUN_ID: '12345',
  COVERAGE_WORKFLOW_REF: 'frivas/roots/.github/workflows/ci.yml@refs/heads/develop',
  SOURCE_TARGET_BRANCH: 'develop',
});

test('packages exact-SHA coverage evidence without publishing', () => {
  const cwd = fixture();
  const result = spawnSync('bash', [script], { cwd, env: env(cwd), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(readFileSync(join(cwd, 'coverage-evidence.json'), 'utf8'));
  assert.equal(evidence.repo, 'frivas/roots');
  assert.equal(evidence.source.commitSha, sha);
  assert.equal(evidence.testCount, 15);
  assert.equal(evidence.passing, 15);
  assert.equal(evidence.coveragePercent, 90);
});

test('missing source identity fails closed', () => {
  const cwd = fixture();
  const invalidEnv = env(cwd);
  delete invalidEnv.SOURCE_COMMIT_SHA;
  const result = spawnSync('bash', [script], { cwd, env: invalidEnv, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SOURCE_COMMIT_SHA/);
});

test('Roots cannot impersonate the authoritative Portfolio publisher', () => {
  const cwd = fixture();
  const publishEnv = env(cwd);
  delete publishEnv.COVERAGE_DRY_RUN;
  publishEnv.COVERAGE_SECRET = 'not-used';
  const result = spawnSync('bash', [script], { cwd, env: publishEnv, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /portfolio-central/);
});
