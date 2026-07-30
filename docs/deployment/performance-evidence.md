# Performance evidence contract

`performance-slo.json` defines hard release thresholds. Bundle budgets run on
every pull request. Runtime SLOs are checked by the read-only deployed canary
against an exact-SHA observation payload supplied by the monitoring collectors.

The observation payload must use schema version 1, identify the same immutable
release SHA as the canary, include an ISO `collectedAt` timestamp, and provide:

- Web Vitals p75 for LCP, INP, and CLS.
- Backend p50, p95, p99, error rate, and timeout rate.
- External provider p50, p95, p99, error rate, and timeout rate.

Rates are decimals from 0 to 1. Durations are milliseconds. The canary never
calls an external AI provider itself; provider measurements must come from the
authorized service telemetry window. Missing, malformed, cross-SHA, or
over-budget observations fail the release gate.
