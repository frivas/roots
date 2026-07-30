import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const evidenceFile = process.argv[2];
if (!evidenceFile) {
  throw new Error('usage: validate-local-contract-evidence.mjs <vitest-json>');
}

const report = JSON.parse(readFileSync(resolve(evidenceFile), 'utf8'));
const assertions = (report.testResults ?? []).flatMap(
  (result) => result.assertionResults ?? [],
);
const expected = assertions.filter((assertion) =>
  [
    assertion.fullName,
    assertion.title,
    assertion.ancestorTitles?.join(' '),
  ].some((value) => value?.includes('passes a Clerk-shaped string subject')),
);

if (expected.length !== 1) {
  throw new Error(`expected one enabled Clerk-shaped contract test, found ${expected.length}`);
}
if (expected[0].status !== 'passed') {
  throw new Error(`enabled Clerk-shaped contract test did not pass: ${expected[0].status}`);
}
if (
  report.numFailedTests !== 0 ||
  report.numPendingTests !== 0 ||
  report.numPassedTests < 1
) {
  throw new Error('enabled Clerk-shaped contract evidence contains failed or skipped tests');
}

console.log('Verified the enabled local Clerk-shaped RLS contract ran and passed.');
