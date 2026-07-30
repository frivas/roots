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
  'validate:release-config',
  'test:serverless',
  'test:contracts',
  'test:rls:local',
]) {
  if (!rootPackage.scripts[script]) fail(`missing canonical root script: ${script}`);
}
if (rootPackage.devDependencies.knip !== '6.29.0') fail('Knip must be exactly pinned');
if (frontendPackage.dependencies['react-router-dom'] !== '7.18.2') {
  fail('react-router-dom must be exactly pinned to the compatible patched release');
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
  for (const job of Object.values(workflow.jobs)) {
    if (job?.name) jobNames.add(job.name);
  }
}

for (const required of [
  'Lint & Typecheck',
  'Unit Tests',
  'Build',
  'Playwright smoke',
  'npm audit',
  'License Check',
  'Secret Scanning',
  'Knip',
  'Analyze Bundle',
  'Serverless adapter smoke',
  'Real Clerk and Supabase contract',
  'Local Clerk RLS contract',
  'Exact-SHA deployed canary',
]) {
  if (!jobNames.has(required)) fail(`missing workflow check: ${required}`);
}

console.log(`Validated ${workflowFiles.length} workflow files and runtime/tooling contracts.`);
