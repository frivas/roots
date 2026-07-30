#!/usr/bin/env bash
# Builds exact-SHA Roots coverage evidence and, for an authorized native
# transport, delivers it with the Portfolio HMAC contract.
set -euo pipefail

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
require() { [ -n "${!1:-}" ] || fail "$1 is required"; }

FRONTEND_COVERAGE_FILE="frontend/coverage/coverage-summary.json"
BACKEND_COVERAGE_FILE="backend/coverage/coverage-summary.json"
FRONTEND_RESULTS_FILE="frontend/coverage/test-results.json"
BACKEND_RESULTS_FILE="backend/coverage/test-results.json"
API_URL="${PORTFOLIO_COVERAGE_URL:-https://portfolio.thecreativetoken.com/api/coverage}"
COVERAGE_MAX_ATTEMPTS="${COVERAGE_MAX_ATTEMPTS:-3}"
COVERAGE_RETRY_DELAY_SECONDS="${COVERAGE_RETRY_DELAY_SECONDS:-2}"
COVERAGE_REPORTED_AT="${COVERAGE_REPORTED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
COVERAGE_PROVIDER="${COVERAGE_PROVIDER:-github-actions}"
SOURCE_REPOSITORY="${SOURCE_REPOSITORY:-${GITHUB_REPOSITORY:-${REPO:-}}}"

for required_file in \
  "$FRONTEND_COVERAGE_FILE" \
  "$BACKEND_COVERAGE_FILE" \
  "$FRONTEND_RESULTS_FILE" \
  "$BACKEND_RESULTS_FILE"; do
  [ -f "$required_file" ] || fail "Missing ${required_file}"
done

REPO="${REPO:-${GITHUB_REPOSITORY:-}}"
require REPO
require SOURCE_COMMIT_SHA
require COVERAGE_RUN_ID
require COVERAGE_WORKFLOW_REF
require SOURCE_TARGET_BRANCH

case "$COVERAGE_MAX_ATTEMPTS" in
  ''|*[!0-9]*) fail "COVERAGE_MAX_ATTEMPTS must be a positive integer" ;;
esac
[ "$COVERAGE_MAX_ATTEMPTS" -ge 1 ] || fail "COVERAGE_MAX_ATTEMPTS must be a positive integer"

BODY=$(REPO="$REPO" \
  FRONTEND_COVERAGE_FILE="$FRONTEND_COVERAGE_FILE" \
  BACKEND_COVERAGE_FILE="$BACKEND_COVERAGE_FILE" \
  FRONTEND_RESULTS_FILE="$FRONTEND_RESULTS_FILE" \
  BACKEND_RESULTS_FILE="$BACKEND_RESULTS_FILE" \
  SOURCE_COMMIT_SHA="$SOURCE_COMMIT_SHA" \
  COVERAGE_RUN_ID="$COVERAGE_RUN_ID" \
  COVERAGE_WORKFLOW_REF="$COVERAGE_WORKFLOW_REF" \
  SOURCE_TARGET_BRANCH="$SOURCE_TARGET_BRANCH" \
  COVERAGE_REPORTED_AT="$COVERAGE_REPORTED_AT" \
  COVERAGE_PROVIDER="$COVERAGE_PROVIDER" \
  SOURCE_REPOSITORY="$SOURCE_REPOSITORY" \
  node <<'NODE'
const fs = require("node:fs");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const coverageFiles = [
  process.env.FRONTEND_COVERAGE_FILE,
  process.env.BACKEND_COVERAGE_FILE,
];
const resultFiles = [
  process.env.FRONTEND_RESULTS_FILE,
  process.env.BACKEND_RESULTS_FILE,
];

let linesCovered = 0;
let linesTotal = 0;
for (const file of coverageFiles) {
  const summary = readJson(file);
  linesCovered += summary.total?.lines?.covered ?? 0;
  linesTotal += summary.total?.lines?.total ?? 0;
}

let testCount = 0;
let testFiles = 0;
let passing = 0;
let failing = 0;
for (const file of resultFiles) {
  const results = readJson(file);
  testCount += results.numTotalTests ?? 0;
  passing += results.numPassedTests ?? 0;
  failing += results.numFailedTests ?? 0;
  if (Array.isArray(results.testResults)) testFiles += results.testResults.length;
}

const payload = {
  repo: process.env.REPO,
  coveragePercent:
    linesTotal > 0 ? Number(((linesCovered / linesTotal) * 100).toFixed(2)) : null,
  testCount,
  testFiles,
  passing,
  failing,
  source: {
    provider: process.env.COVERAGE_PROVIDER,
    repository: process.env.SOURCE_REPOSITORY,
    runId: process.env.COVERAGE_RUN_ID,
    workflowRef: process.env.COVERAGE_WORKFLOW_REF,
    targetBranch: process.env.SOURCE_TARGET_BRANCH,
    commitSha: process.env.SOURCE_COMMIT_SHA,
    reportedAt: new Date(process.env.COVERAGE_REPORTED_AT).toISOString(),
  },
};

if (!/^[0-9a-fA-F]{40}$/.test(payload.source.commitSha)) {
  throw new Error("SOURCE_COMMIT_SHA must be a 40-character SHA");
}
if (!/^\d+$/.test(payload.source.runId)) {
  throw new Error("COVERAGE_RUN_ID must be numeric");
}
if (!payload.source.workflowRef.includes("@refs/heads/")) {
  throw new Error("COVERAGE_WORKFLOW_REF must identify a branch");
}
if (!/^[A-Za-z0-9._/-]{1,200}$/.test(payload.source.targetBranch)) {
  throw new Error("SOURCE_TARGET_BRANCH must identify a branch");
}
if (!Number.isInteger(testCount) || testCount <= 0 ||
    !Number.isFinite(payload.coveragePercent) || payload.coveragePercent < 0 ||
    payload.coveragePercent > 100) {
  throw new Error("Coverage evidence must contain positive tests and finite coverage");
}

process.stdout.write(JSON.stringify(payload));
NODE
)

if [ -n "${COVERAGE_EVIDENCE_FILE:-}" ]; then
  mkdir -p "$(dirname "$COVERAGE_EVIDENCE_FILE")"
  printf '%s\n' "$BODY" > "$COVERAGE_EVIDENCE_FILE"
fi

if [ "${COVERAGE_DRY_RUN:-0}" = "1" ]; then
  printf 'Exact-SHA coverage evidence created for %s at %s.\n' "$REPO" "$SOURCE_COMMIT_SHA"
  exit 0
fi

# Portfolio is the sole authoritative publisher for Roots. Refuse to let a
# Roots workflow impersonate that producer even when it has a copied secret.
[ "$COVERAGE_PROVIDER" = "portfolio-central" ] || \
  fail "Only the portfolio-central producer may publish Roots coverage"
[ "$SOURCE_REPOSITORY" = "juan294/portfolio" ] || \
  fail "Coverage publisher source must be juan294/portfolio"
require COVERAGE_SECRET
SIGNATURE=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$COVERAGE_SECRET" -hex | awk '{print $NF}')

attempt=1
while [ "$attempt" -le "$COVERAGE_MAX_ATTEMPTS" ]; do
  set +e
  HTTP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
    --connect-timeout 10 --max-time 30 \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "X-Coverage-Signature-256: sha256=${SIGNATURE}" \
    --data-binary "$BODY")
  CURL_EXIT=$?
  set -e

  if [ "$CURL_EXIT" -eq 0 ] && [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    printf 'Coverage reported successfully (HTTP %s).\n' "$HTTP_STATUS"
    exit 0
  fi

  retryable=false
  if [ "$CURL_EXIT" -ne 0 ] || [ "$HTTP_STATUS" = "408" ] || \
     [ "$HTTP_STATUS" = "425" ] || [ "$HTTP_STATUS" = "429" ] || \
     [[ "$HTTP_STATUS" =~ ^5[0-9][0-9]$ ]]; then
    retryable=true
  fi
  [ "$retryable" = "true" ] || fail "Coverage delivery rejected with HTTP ${HTTP_STATUS:-none}"

  printf 'Coverage attempt %s/%s failed (curl=%s HTTP=%s).\n' \
    "$attempt" "$COVERAGE_MAX_ATTEMPTS" "$CURL_EXIT" "${HTTP_STATUS:-none}" >&2
  if [ "$attempt" -lt "$COVERAGE_MAX_ATTEMPTS" ]; then
    sleep "$COVERAGE_RETRY_DELAY_SECONDS"
  fi
  attempt=$((attempt + 1))
done

fail "Coverage delivery exhausted ${COVERAGE_MAX_ATTEMPTS} attempts"
