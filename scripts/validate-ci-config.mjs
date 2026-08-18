import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const repositoryRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const read = (path) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const fail = (message) => {
  throw new Error(message);
};

const rootPackage = json('package.json');
const frontendPackage = json('frontend/package.json');
const backendPackage = json('backend/package.json');
const buildConfig = json('backend/tsconfig.build.json');
const protection = json('.github/branch-protection.json');
const nvmVersion = read('.nvmrc').trim();

if (nvmVersion !== '22.22.2') fail('.nvmrc must pin Node 22.22.2');
for (const [name, packageJson] of Object.entries({
  root: rootPackage,
  frontend: frontendPackage,
  backend: backendPackage,
})) {
  if (packageJson.engines?.node !== '>=22.22.2 <23') {
    fail(`${name} package must enforce the Node 22 runtime contract`);
  }
}

for (const script of [
  'typecheck',
  'dead-code',
  'license-check',
  'audit:production',
  'check:bundle',
  'check:performance-slo',
  'test:tooling',
  'validate:ci-config',
  'validate:release-config',
  'test:serverless',
  'test:contracts',
  'test:rls:local',
  'test:e2e:auth',
]) {
  if (!rootPackage.scripts[script]) fail(`missing canonical root script: ${script}`);
}
if (rootPackage.devDependencies.knip !== '6.29.0') fail('Knip must be exactly pinned');
if (frontendPackage.dependencies['react-router-dom']) {
  fail('react-router-dom must not be reintroduced -- it was migrated to react-router to close a CSRF advisory (GHSA, vulnerable range >=7.12.0 <8.3.0)');
}
const reactRouterVersion = frontendPackage.dependencies['react-router'];
if (!reactRouterVersion) fail('react-router must be present as a direct dependency');
const reactRouterMajor = Number(reactRouterVersion.replace(/^[^\d]*/, '').split('.')[0]);
if (!(reactRouterMajor >= 8)) {
  fail('react-router must be pinned at >=8.3.0 -- versions below that (including any 7.x) fall inside the patched CSRF advisory range');
}

if (
  buildConfig.compilerOptions?.sourceMap !== false ||
  buildConfig.compilerOptions?.declarationMap !== false
) {
  fail('production backend builds must disable source maps');
}
const excluded = buildConfig.exclude ?? [];
if (!excluded.some((pattern) => pattern.includes('test'))) {
  fail('production backend builds must exclude test sources');
}

const netlify = read('frontend/netlify.toml');
for (const expected of [
  'NODE_VERSION = "22.22.2"',
  'Cache-Control = "public, max-age=31536000, immutable"',
  'command = "npm run build:frontend:release"',
  'for = "/release.json"',
]) {
  if (!netlify.includes(expected)) fail(`Netlify contract is missing: ${expected}`);
}
const playwright = read('frontend/playwright.config.ts');
for (const project of ['desktop-chrome', 'mobile-chrome', 'mobile-safari']) {
  if (!playwright.includes(`name: '${project}'`)) {
    fail(`Playwright is missing the ${project} project`);
  }
}

const workflowDir = resolve(repositoryRoot, '.github/workflows');
const workflowFiles = readdirSync(workflowDir)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  .sort();
const jobNames = new Set();
const workflows = new Map();
for (const file of workflowFiles) {
  const source = read(`.github/workflows/${file}`);
  if (/\bnpx\b/.test(source)) fail(`${file} must use canonical pinned scripts instead of npx`);
  let workflow;
  try {
    workflow = parse(source, { schema: 'core' });
  } catch (error) {
    fail(`${file} is invalid YAML: ${error.message}`);
  }
  if (!workflow?.name || !workflow?.on || !workflow?.jobs) {
    fail(`${file} must define a name, trigger, and jobs`);
  }
  workflows.set(file, workflow);
  for (const job of Object.values(workflow.jobs)) {
    if (job?.name) jobNames.add(job.name);
  }
}

const requiredChecks = new Set();
let canonicalRequiredChecks;
for (const branchName of ['develop', 'main']) {
  const checks = protection.branches?.[branchName]?.requiredStatusChecks;
  if (
    !Array.isArray(checks) ||
    checks.length === 0 ||
    new Set(checks).size !== checks.length
  ) {
    fail(`${branchName} must define unique required status checks`);
  }
  canonicalRequiredChecks ??= checks;
  if (
    canonicalRequiredChecks.length !== checks.length ||
    canonicalRequiredChecks.some((check) => !checks.includes(check))
  ) {
    fail(`${branchName} required checks must match develop`);
  }
  for (const check of checks) requiredChecks.add(check);
}
for (const required of requiredChecks) {
  if (!jobNames.has(required)) fail(`missing required workflow check: ${required}`);
}

for (const expected of [
  'Serverless adapter smoke',
  'Local Clerk-shaped RLS contract',
  'Remote Clerk-issued-token contract',
  'Real Clerk browser auth contract',
  'Exact-SHA deployed canary',
]) {
  if (!jobNames.has(expected)) fail(`missing workflow check: ${expected}`);
}

const ciSource = read('.github/workflows/ci.yml');
for (const command of ['npm run test:tooling', 'npm run validate:ci-config']) {
  if (!ciSource.includes(command)) fail(`CI tooling check must run: ${command}`);
}

const runCommands = (workflowFile, jobId) =>
  (workflows.get(workflowFile)?.jobs?.[jobId]?.steps ?? [])
    .map((step) => step?.run)
    .filter(Boolean)
    .join('\n');
const usesDependencyCache = (workflowFile, jobId) =>
  (workflows.get(workflowFile)?.jobs?.[jobId]?.steps ?? [])
    .some((step) => step?.with?.cache);
for (const [workflowFile, jobId] of [
  ['security.yml', 'npm-audit'],
  ['security.yml', 'license-check'],
  ['deployed-canary.yml', 'canary'],
]) {
  if (/\bnpm ci\b/.test(runCommands(workflowFile, jobId))) {
    fail(`${workflowFile}:${jobId} must not install the full workspace`);
  }
  if (usesDependencyCache(workflowFile, jobId)) {
    fail(`${workflowFile}:${jobId} must not restore an unused dependency cache`);
  }
}
if (!/\bnpm ci\b/.test(runCommands('integration-contracts.yml', 'local-clerk-shaped-rls'))) {
  fail('the local Clerk-shaped RLS contract must install its real test dependencies');
}

const deployedCanarySource = read('.github/workflows/deployed-canary.yml');
if (
  deployedCanarySource.includes('performance_observations_json') ||
  !deployedCanarySource.includes('node scripts/collect-performance-observations.mjs')
) {
  fail('the deployed canary must collect performance evidence instead of accepting input');
}
const integrationSource = read('.github/workflows/integration-contracts.yml');
for (const expected of [
  'run_remote_clerk_issued_token_contract',
  'run_real_clerk_browser_auth_contract',
  'npm --workspace backend run test:contracts --',
  '--reporter=json',
  'validate-local-contract-evidence.mjs',
  'run-remote-clerk-supabase-contract.mjs',
  'npm run test:e2e:auth',
]) {
  if (!integrationSource.includes(expected)) {
    fail(`integration contracts workflow is missing: ${expected}`);
  }
}

console.log(`Validated ${workflowFiles.length} workflow files and runtime/tooling contracts.`);
