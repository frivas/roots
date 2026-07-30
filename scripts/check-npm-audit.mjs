import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const getArgument = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const workspace = getArgument('--workspace');
const auditFile = getArgument('--audit-file');
if (!workspace && !auditFile) {
  throw new Error('--workspace is required unless --audit-file is supplied');
}

let raw;
if (auditFile) {
  raw = readFileSync(resolve(auditFile), 'utf8');
} else {
  const result = spawnSync(
    'npm',
    ['audit', `--workspace=${workspace}`, '--omit=dev', '--json'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  );
  raw = result.stdout;
  if (!raw.trim()) throw new Error(result.stderr || 'npm audit returned no JSON');
}
const audit = JSON.parse(raw);
if (
  typeof audit.auditReportVersion !== 'number' ||
  !audit.metadata?.vulnerabilities ||
  !audit.vulnerabilities
) {
  throw new Error('npm audit response is missing its report schema or vulnerability metadata');
}

if (process.env.AUDIT_EVIDENCE_DIR && workspace) {
  const directory = resolve(process.env.AUDIT_EVIDENCE_DIR);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, `${basename(workspace)}-npm-audit.json`), raw);
}

const severe = Object.values(audit.vulnerabilities ?? {}).filter(
  (entry) => entry.severity === 'high' || entry.severity === 'critical',
);
const reportedSevere =
  audit.metadata.vulnerabilities.high + audit.metadata.vulnerabilities.critical;
if (!Number.isInteger(reportedSevere) || reportedSevere !== severe.length) {
  throw new Error('npm audit vulnerability metadata does not match the package findings');
}
if (severe.length === 0) {
  console.log(`${workspace ?? 'fixture'} production audit has no high or critical findings.`);
  process.exit(0);
}

const router = audit.vulnerabilities?.['react-router'];
const exactAdvisories = (router?.via ?? [])
  .filter((entry) => typeof entry === 'object')
  .map((entry) => entry.url?.split('/').pop());
const exactRscOnly =
  workspace === 'frontend' &&
  severe.every((entry) => ['react-router', 'react-router-dom'].includes(entry.name)) &&
  exactAdvisories.length === 1 &&
  exactAdvisories[0] === 'GHSA-qwww-vcr4-c8h2' &&
  (audit.vulnerabilities?.['react-router-dom']?.via ?? []).every(
    (entry) => entry === 'react-router',
  );

if (!exactRscOnly) {
  const summary = severe.map((entry) => `${entry.name} (${entry.severity})`).join(', ');
  throw new Error(`unaccepted production audit findings: ${summary}`);
}
console.log(
  'Scoped audit accepted only GHSA-qwww-vcr4-c8h2 after the separate RSC-mode proof.',
);
