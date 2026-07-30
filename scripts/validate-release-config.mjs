import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const readJson = (path) =>
  JSON.parse(readFileSync(new URL(path, root), 'utf8'));

const provider = readJson('docs/deployment/provider-contract.json');
const protection = readJson('.github/branch-protection.json');

const fail = (message) => {
  throw new Error(message);
};

if (provider.schemaVersion !== 1 || provider.productionBranch !== 'main') {
  fail('provider contract must use schema 1 and production branch main');
}
if (
  provider.backend.projectId !== 'prj_GSAg55JO0lYdjI7tCQqwC6u7qp4C' ||
  provider.backend.orgId !== 'team_eJRc3uJPBTvXknc9WbVr4nlh'
) {
  fail('Vercel project identity does not match the verified Roots API project');
}
if (
  provider.coverage.transport !== 'portfolio-central' ||
  provider.coverage.producerRepository !== 'juan294/portfolio' ||
  provider.coverage.targetRepository !== 'frivas/roots'
) {
  fail('coverage publication must remain owned by the Portfolio workflow');
}
const performanceEvidence = provider.performanceEvidence;
if (
  !performanceEvidence ||
  !provider.release.requiredVariables.includes(performanceEvidence.collectorUrlVariable) ||
  !provider.release.requiredVariables.includes(performanceEvidence.collectorIdVariable) ||
  !provider.release.requiredVariables.includes(performanceEvidence.collectorTokenVariable) ||
  performanceEvidence.workflowAudience !==
    'frivas/roots/.github/workflows/deployed-canary.yml'
) {
  fail('provider contract must bind release evidence to the deployed canary collector');
}

const protectedBranches = ['develop', 'main'];
let canonicalRequiredChecks;
for (const branchName of protectedBranches) {
  const branch = protection.branches?.[branchName];
  if (!branch) fail(`missing branch protection contract for ${branchName}`);
  if (branch.requiredApprovingReviewCount < 1) {
    fail(`${branchName} must require an approving review`);
  }
  if (
    !branch.dismissStaleReviews ||
    !branch.requireConversationResolution ||
    !branch.requireLinearHistory ||
    !branch.requireBranchesToBeUpToDate ||
    !branch.enforceForAdministrators ||
    branch.allowForcePushes ||
    branch.allowDeletions
  ) {
    fail(`${branchName} branch protection contract is incomplete`);
  }
  if (
    !Array.isArray(branch.requiredStatusChecks) ||
    branch.requiredStatusChecks.length === 0 ||
    new Set(branch.requiredStatusChecks).size !== branch.requiredStatusChecks.length
  ) {
    fail(`${branchName} must define unique required status checks`);
  }
  canonicalRequiredChecks ??= branch.requiredStatusChecks;
  if (
    canonicalRequiredChecks.length !== branch.requiredStatusChecks.length ||
    canonicalRequiredChecks.some((check) => !branch.requiredStatusChecks.includes(check))
  ) {
    fail(`${branchName} required checks must match ${protectedBranches[0]}`);
  }
}

if (process.argv.includes('--release')) {
  for (const name of provider.release.requiredVariables) {
    if (!process.env[name]) fail(`missing required release variable: ${name}`);
  }

  const shaPattern = /^[0-9a-f]{40}$/;
  const releaseSha = process.env.RELEASE_SHA;
  if (!shaPattern.test(releaseSha)) fail('RELEASE_SHA must be a lowercase 40-character SHA');
  for (const name of ['NETLIFY_DEPLOYED_SHA', 'VERCEL_DEPLOYED_SHA']) {
    if (process.env[name] !== releaseSha) {
      fail(`${name} must match RELEASE_SHA exactly`);
    }
  }
  if (process.env.VERCEL_PROJECT_ID !== provider.backend.projectId) {
    fail('VERCEL_PROJECT_ID does not match the checked provider contract');
  }
  if (process.env.NETLIFY_ROLLBACK_DEPLOY_ID === process.env.NETLIFY_DEPLOY_ID) {
    fail('Netlify rollback deploy must differ from the current deploy');
  }
  if (process.env.VERCEL_ROLLBACK_DEPLOYMENT_ID === process.env.VERCEL_DEPLOYMENT_ID) {
    fail('Vercel rollback deployment must differ from the current deployment');
  }
  for (const name of [
    'NETLIFY_PRODUCTION_URL',
    'VERCEL_PRODUCTION_URL',
    performanceEvidence.collectorUrlVariable,
  ]) {
    let url;
    try {
      url = new URL(process.env[name]);
    } catch {
      fail(`${name} must be a valid URL`);
    }
    if (url.protocol !== 'https:') fail(`${name} must use HTTPS`);
  }
}

console.log(
  process.argv.includes('--release')
    ? 'Release identity contract is valid.'
    : 'Checked release configuration is valid.',
);
