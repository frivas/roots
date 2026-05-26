#!/usr/bin/env bash
# Reports aggregated frontend + backend coverage metrics to the Portfolio API.
# Required env: COVERAGE_SECRET
# Optional env: REPO, PORTFOLIO_COVERAGE_URL
set -euo pipefail

FRONTEND_COVERAGE_FILE="frontend/coverage/coverage-summary.json"
BACKEND_COVERAGE_FILE="backend/coverage/coverage-summary.json"
FRONTEND_RESULTS_FILE="frontend/coverage/test-results.json"
BACKEND_RESULTS_FILE="backend/coverage/test-results.json"
API_URL="${PORTFOLIO_COVERAGE_URL:-https://portfolio.thecreativetoken.com/api/coverage}"

for required_file in \
  "$FRONTEND_COVERAGE_FILE" \
  "$BACKEND_COVERAGE_FILE" \
  "$FRONTEND_RESULTS_FILE" \
  "$BACKEND_RESULTS_FILE"; do
  if [ ! -f "$required_file" ]; then
    echo "Missing ${required_file} - skipping coverage report."
    exit 0
  fi
done

REPO="${REPO:-${GITHUB_REPOSITORY:-}}"
if [ -z "$REPO" ]; then
  echo "REPO and GITHUB_REPOSITORY are both unset - skipping coverage report."
  exit 0
fi

if [ -z "${COVERAGE_SECRET:-}" ]; then
  echo "COVERAGE_SECRET is not set - skipping coverage report."
  exit 0
fi

BODY=$(REPO="$REPO" \
  FRONTEND_COVERAGE_FILE="$FRONTEND_COVERAGE_FILE" \
  BACKEND_COVERAGE_FILE="$BACKEND_COVERAGE_FILE" \
  FRONTEND_RESULTS_FILE="$FRONTEND_RESULTS_FILE" \
  BACKEND_RESULTS_FILE="$BACKEND_RESULTS_FILE" \
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
  if (Array.isArray(results.testResults)) {
    testFiles += results.testResults.length;
  }
}

const payload = {
  repo: process.env.REPO,
  coveragePercent:
    linesTotal > 0 ? Number(((linesCovered / linesTotal) * 100).toFixed(2)) : null,
  testCount,
  testFiles,
  passing,
  failing,
  timestamp: new Date().toISOString(),
};

console.log(JSON.stringify(payload));
NODE
)

SIGNATURE=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$COVERAGE_SECRET" -hex | awk '{print $NF}')

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Coverage-Signature-256: sha256=${SIGNATURE}" \
  -d "$BODY")

if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
  echo "Coverage reported successfully (HTTP ${HTTP_STATUS})."
else
  echo "Coverage report failed with HTTP ${HTTP_STATUS} (non-fatal)."
fi
