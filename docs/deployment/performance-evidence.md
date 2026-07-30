# Performance evidence contract

`performance-slo.json` defines hard release thresholds. Bundle budgets run on
every pull request. Runtime SLOs are checked by the read-only deployed canary
against evidence fetched by the workflow from the authorized collector URL.
Operators cannot paste or dispatch a performance payload.

The collector response must use schema version 1, identify the configured
collector ID and workflow audience, identify the same immutable release SHA as
the canary, include an ISO collection timestamp and measurement window, and
provide:

- Web Vitals p75 for LCP, INP, and CLS.
- Backend p50, p95, p99, error rate, and timeout rate.
- External provider p50, p95, p99, error rate, and timeout rate.

Rates are decimals from 0 to 1. Durations are milliseconds. The measurement
window must be at least five minutes long, end no more than fifteen minutes
before workflow retrieval, and be emitted within five minutes of the window
ending.
The checked provider contract is the source of truth for these limits and the
workflow audience.

The canary never calls an external AI provider itself; provider measurements
must come from the authorized service telemetry window. The workflow requests
that evidence over HTTPS using `PERFORMANCE_COLLECTOR_TOKEN`, records its own
GitHub run identity in the artifact, and never stores the token. Missing
collector configuration, an unreachable collector, malformed or stale
evidence, identity/audience mismatch, a missing dimension, cross-SHA evidence,
or an over-budget observation fails the release gate.
