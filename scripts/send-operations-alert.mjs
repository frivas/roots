const webhookUrl = process.env.ALERT_WEBHOOK_URL;
if (!webhookUrl) {
  console.log('ALERT_WEBHOOK_URL is not configured; workflow failure remains visible in GitHub Actions.');
  process.exit(0);
}

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  signal: AbortSignal.timeout(10_000),
  body: JSON.stringify({
    schemaVersion: 1,
    event: process.env.ALERT_EVENT ?? 'roots_operation_failed',
    repository: process.env.GITHUB_REPOSITORY,
    workflow: process.env.GITHUB_WORKFLOW,
    runId: process.env.GITHUB_RUN_ID,
    runUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    releaseSha: process.env.RELEASE_SHA ?? null,
  }),
});
if (!response.ok) throw new Error(`alert webhook returned HTTP ${response.status}`);
console.log('Sent a redacted operations alert.');
