# Production operations runbook

## Required repository configuration

Configure these GitHub repository variables: `NETLIFY_SITE_ID`,
`NETLIFY_PRODUCTION_URL`, `VERCEL_PRODUCTION_URL`,
`PERFORMANCE_COLLECTOR_URL`, and `PERFORMANCE_COLLECTOR_ID`.

Configure these GitHub Actions secrets with the narrowest provider scope:

- `NETLIFY_AUTH_TOKEN` reads deploy metadata and restores a previously verified
  immutable production deploy after a release-gate failure.
- `VERCEL_TOKEN` reads Roots API deployments and points production traffic to a
  previously verified, previously promoted deployment after a gate failure.
- `PERFORMANCE_COLLECTOR_TOKEN` reads only the Roots production evidence feed.
- `ALERT_WEBHOOK_URL` accepts redacted operational events. The workflow sends
  repository, workflow, run ID, run URL, event type, and release SHA only.

Apply `.github/branch-protection.json` to both protected branches. Require pull
requests, the listed checks, current branches, conversation resolution, linear
history, administrator enforcement, and no force pushes or deletion. Apply
`.github/repository-settings.json` by enabling automatic deletion of merged
head branches. GitHub does not apply these checked contracts automatically.

## Preview contract

Vercel previews are enabled by the absence of `ignoreCommand` in
`backend/vercel.json`. Keep preview Clerk, Supabase, OpenAI, and ElevenLabs
values isolated from production. The backend defaults to `demo`, so a preview
without connected-mode values remains non-mutating and rejects paid work.

Netlify deploy previews must use preview-scoped values for
`VITE_CLERK_PUBLISHABLE_KEY` and `VITE_BACKEND_URL`. The backend URL must name
the matching preview deployment when an end-to-end preview is required.

## Release gate response

For every push to `main`, confirm `Production release gate` has the same SHA as
the successful `CI` run and both provider deployments. Retain these 30-day
artifacts: `deployment-discovery.json`, `release-evidence.json`,
`performance-observations.json`, and, after a failed check,
`rollback-evidence.json`.

If discovery times out, inspect provider build state and commit metadata. Do
not substitute the latest deployment. If the readiness canary or SLO check
fails after discovery, the workflow re-fetches all four deployment records. It
dispatches no rollback unless both current deployments match the release SHA
and both immutable targets are verified as previous production deployments.

## Rollback

Rollback changes production and requires explicit authorization. Record the
incident and both current and rollback deploy IDs before either action.

Restore Netlify with its documented immutable-deploy endpoint:

```bash
curl --fail-with-body --request POST \
  --header "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys/$NETLIFY_ROLLBACK_DEPLOY_ID/restore"
```

Restore the recorded Vercel production deployment:

```bash
vercel rollback "$VERCEL_ROLLBACK_DEPLOYMENT_ID" \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_ORG_ID" \
  --yes
```

Wait for both providers to report ready. Run `Deployed canary` with the
rollback SHA and new current/previous ID pairs. Close the incident only after
frontend `release.json`, backend `/ready`, and canary evidence all report the
rollback SHA.

## Health and alert response

`Production health` runs four times per hour. It checks the frontend, reads
`release.json`, checks backend `/ready`, and rejects dependency failures or
cross-provider SHA skew. Evidence includes latency, dependency states, mode,
backend request ID, run identity, and time. It excludes credentials and user
data.

On failure, the workflow posts a redacted event to `ALERT_WEBHOOK_URL`. Use the
run URL and request ID to query provider logs. Configure provider-native alerts
for backend error rate, function timeouts, and paid-service spend. Configure a
log drain or retention policy that preserves structured request IDs and
redacts authorization, cookies, webhook signatures, and set-cookie values.
The GitHub probe detects availability and version skew. It does not replace
provider error telemetry or frontend exception monitoring.
